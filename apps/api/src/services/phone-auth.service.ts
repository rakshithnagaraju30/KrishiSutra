/**
 * Phone OTP sign-in and JWT sessions (Part 3.2).
 *
 * Flow
 *   register   → creates a PENDING_VERIFICATION farmer (or upgrades the calling device account) and
 *                sends a REGISTRATION code.  The phone is NOT marked verified.
 *   verify-otp → correct REGISTRATION code: phone verified, account ACTIVE, signed in (tokens).
 *   send-otp   → (re)sends a REGISTRATION or LOGIN code. Same answer whether or not the number is
 *                registered (unknown numbers get a "decoy" row: same cooldown, no SMS).
 *   login      → correct LOGIN code for an ACTIVE, verified account: signed in.
 *   refresh    → rotates the refresh token; re-use of an old token revokes the whole session family.
 *   logout     → revokes the session family of the given refresh token.
 *
 * Security notes
 *   - Codes: CSPRNG, stored as HMAC-SHA256 only, expire, limited attempts (atomic counter), single use,
 *     older open codes are invalidated when a new one is sent, resend cooldown + hourly cap per number.
 *   - Refresh tokens: random 256-bit, only SHA-256 stored. Access tokens: short-lived JWT, no roles inside.
 *   - Codes and tokens are never logged.
 */
import { randomUUID } from 'node:crypto';
import type { PrismaClient } from '../../generated/prisma/client.ts';
import type { OtpPurpose } from '../../generated/prisma/enums.ts';
import { maskPhone } from '../auth/phone.ts';
import { generateOtp, hashOtp, otpMatches } from '../auth/otp.ts';
import { newRefreshToken, REFRESH_TOKEN_FORMAT, sha256Hex, signAccessToken, verifyAccessToken } from '../auth/tokens.ts';
import type { AppConfig } from '../config/env.ts';
import type { Logger } from '../config/logger.ts';
import type { SmsSender } from '../integrations/sms/index.ts';
import { HttpError } from '../utils/http-error.ts';
import type { LanguageCode } from '../utils/language.ts';
import type { LoginBody, RegisterBody, SendOtpBody, VerifyOtpBody } from '../validators/auth.schemas.ts';
import type { AuthService } from './auth.service.ts';

type Tx = Parameters<Parameters<PrismaClient['$transaction']>[0]>[0];

export type TokenPair = {
  tokenType: 'Bearer';
  accessToken: string;
  /** Seconds until the access token expires. */
  expiresIn: number;
  refreshToken: string;
  refreshTokenExpiresAt: string;
};

const DAY_MS = 86_400_000;
const otpInvalid = (details?: unknown) => new HttpError(400, 'OTP_INVALID', 'The code is not correct. Check the SMS and try again.', details);

export type PhoneAuthService = ReturnType<typeof createPhoneAuthService>;

export function createPhoneAuthService(deps: { prisma: PrismaClient; config: AppConfig; logger: Logger; sms: SmsSender | null; device: AuthService }) {
  const { prisma, config, logger, sms } = deps;
  const settings = config.auth;

  function enabled(): { jwtSecret: Uint8Array; otpSecret: string; sms: SmsSender } {
    if (!settings.phoneAuthEnabled || !settings.jwtSecret || !settings.otpSecret || !sms) {
      throw new HttpError(503, 'OTP_UNAVAILABLE', 'Phone sign-in is not available yet. Please try again later.');
    }
    return { jwtSecret: settings.jwtSecret, otpSecret: settings.otpSecret, sms };
  }

  /** Serialises OTP work per phone number inside a transaction (prevents double sends / double use). */
  async function lockPhone(tx: Tx, phone: string) {
    await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${`otp:${phone}`}))`;
  }

  async function languageOf(userId: string | null, fallback?: LanguageCode): Promise<'en' | 'kn' | 'hi'> {
    if (fallback === 'kn' || fallback === 'hi' || fallback === 'en') return fallback;
    if (!userId) return 'en';
    const u = await prisma.user.findUnique({ where: { id: userId }, select: { preferredLanguage: { select: { code: true } } } });
    const code = u?.preferredLanguage?.code;
    return code === 'kn' || code === 'hi' ? code : 'en';
  }

  /**
   * Records a new code for (phone, purpose) and sends it when userId is set.
   * Applies the resend cooldown and the hourly cap per number to every request, including decoys.
   */
  async function issueOtp(phone: string, purpose: OtpPurpose, userId: string | null, language?: LanguageCode) {
    const { otpSecret, sms: sender } = enabled();
    const code = generateOtp(settings.otp.length);
    const now = new Date();

    const row = await prisma.$transaction(async (tx) => {
      await lockPhone(tx, phone);
      const last = await tx.phoneOtp.findFirst({ where: { phone, purpose }, orderBy: { sentAt: 'desc' }, select: { sentAt: true } });
      const waitMs = last ? last.sentAt.getTime() + settings.otp.resendCooldownSeconds * 1000 - now.getTime() : 0;
      if (waitMs > 0) {
        const retryAfterSeconds = Math.ceil(waitMs / 1000);
        throw new HttpError(429, 'OTP_COOLDOWN', `Please wait ${retryAfterSeconds} seconds before asking for a new code.`, { retryAfterSeconds });
      }
      const recent = await tx.phoneOtp.count({ where: { phone, sentAt: { gt: new Date(now.getTime() - 3_600_000) } } });
      if (recent >= settings.otp.maxPerPhonePerHour) {
        throw new HttpError(429, 'OTP_LIMIT_REACHED', 'Too many codes were requested for this number. Please try again in an hour.');
      }
      await tx.phoneOtp.updateMany({ where: { phone, purpose, consumedAt: null, invalidatedAt: null }, data: { invalidatedAt: now } });
      return tx.phoneOtp.create({
        data: {
          phone, purpose, userId, codeHash: hashOtp(otpSecret, phone, purpose, code),
          sentAt: now, expiresAt: new Date(now.getTime() + settings.otp.ttlSeconds * 1000), maxAttempts: settings.otp.maxAttempts,
        },
        select: { id: true },
      });
    });

    if (userId) {
      try {
        await sender.sendOtp({ to: phone, code, purpose, language: await languageOf(userId, language), expiresInMinutes: Math.ceil(settings.otp.ttlSeconds / 60) });
      } catch (error) {
        await prisma.phoneOtp.update({ where: { id: row.id }, data: { invalidatedAt: new Date() } });
        logger.error({ err: { message: error instanceof Error ? error.message : 'unknown' }, phone: maskPhone(phone), provider: sender.name }, 'OTP SMS could not be sent');
        throw new HttpError(502, 'OTP_SEND_FAILED', 'The SMS could not be sent. Please try again.');
      }
    }
    return { phone: maskPhone(phone), expiresInSeconds: settings.otp.ttlSeconds, resendAfterSeconds: settings.otp.resendCooldownSeconds };
  }

  /** Checks a code and marks it used. Returns the user it was issued for. */
  async function consumeOtp(phone: string, purpose: OtpPurpose, code: string): Promise<string> {
    const { otpSecret } = enabled();
    const row = await prisma.phoneOtp.findFirst({
      where: { phone, purpose, consumedAt: null, invalidatedAt: null },
      orderBy: { sentAt: 'desc' },
      select: { id: true, userId: true, codeHash: true, expiresAt: true, attempts: true, maxAttempts: true },
    });
    if (!row) throw otpInvalid();
    if (row.expiresAt.getTime() <= Date.now()) throw new HttpError(400, 'OTP_EXPIRED', 'This code has expired. Please ask for a new one.');
    // Count the attempt first (atomic), so parallel guesses cannot exceed the limit.
    const counted = await prisma.phoneOtp.updateMany({
      where: { id: row.id, consumedAt: null, invalidatedAt: null, attempts: { lt: row.maxAttempts } },
      data: { attempts: { increment: 1 } },
    });
    if (counted.count === 0) throw new HttpError(400, 'OTP_ATTEMPTS_EXCEEDED', 'Too many wrong codes. Please ask for a new one.');
    const attemptsLeft = Math.max(0, row.maxAttempts - (row.attempts + 1));
    if (!row.userId || !otpMatches(otpSecret, phone, purpose, code, row.codeHash)) throw otpInvalid({ attemptsLeft });
    const used = await prisma.phoneOtp.updateMany({ where: { id: row.id, consumedAt: null, invalidatedAt: null }, data: { consumedAt: new Date() } });
    if (used.count === 0) throw otpInvalid({ attemptsLeft });
    return row.userId;
  }

  async function startSession(userId: string, platform?: string): Promise<TokenPair> {
    const { jwtSecret } = enabled();
    const refreshToken = newRefreshToken();
    const familyId = randomUUID();
    const expiresAt = new Date(Date.now() + settings.refreshTokenTtlDays * DAY_MS);
    await prisma.authSession.create({ data: { userId, familyId, tokenHash: sha256Hex(refreshToken), expiresAt, platform } });
    return {
      tokenType: 'Bearer',
      accessToken: await signAccessToken(jwtSecret, { userId, familyId }, settings.accessTokenTtlSeconds),
      expiresIn: settings.accessTokenTtlSeconds,
      refreshToken,
      refreshTokenExpiresAt: expiresAt.toISOString(),
    };
  }

  async function revokeFamily(familyId: string, reason: 'LOGOUT' | 'REUSE_DETECTED' | 'ACCOUNT_DISABLED' | 'ADMIN') {
    await prisma.authSession.updateMany({ where: { familyId, revokedAt: null }, data: { revokedAt: new Date(), revokedReason: reason } });
  }

  async function signedInUser(userId: string) {
    const u = await prisma.user.findUniqueOrThrow({
      where: { id: userId },
      select: { id: true, fullName: true, phone: true, status: true, roles: { select: { role: { select: { code: true } } } } },
    });
    return { id: u.id, fullName: u.fullName, phone: u.phone, status: u.status, roles: u.roles.map((r) => r.role.code).sort() };
  }

  return {
    get available() {
      return settings.phoneAuthEnabled && sms !== null;
    },

    async register(body: RegisterBody, deviceToken: string | null) {
      enabled();
      const device = deviceToken ? await deps.device.authenticate(deviceToken) : null;
      const preferredLanguageId = body.language
        ? (await prisma.language.findUnique({ where: { code: body.language }, select: { id: true } }))?.id
        : undefined;

      const target = await prisma.$transaction(async (tx) => {
        await lockPhone(tx, body.phone);
        const holder = await tx.user.findUnique({ where: { phone: body.phone }, select: { id: true, phoneVerifiedAt: true, status: true, isDeviceAccount: true, deletedAt: true } });
        const pendingHolder = holder && !holder.phoneVerifiedAt && holder.status === 'PENDING_VERIFICATION' && !holder.isDeviceAccount && !holder.deletedAt;
        if (holder && !pendingHolder) {
          throw new HttpError(409, 'PHONE_ALREADY_REGISTERED', 'This mobile number is already registered. Please log in instead.');
        }

        // An app that already has a device account: upgrade that account (its farms and crops are kept).
        const deviceUser = device
          ? await tx.user.findUnique({ where: { id: device.userId }, select: { id: true, isDeviceAccount: true, phone: true } })
          : null;
        const upgrade = deviceUser && deviceUser.isDeviceAccount && !deviceUser.phone ? deviceUser : null;
        const targetId = upgrade?.id ?? (pendingHolder ? holder!.id : null);

        if (body.email) {
          const emailOwner = await tx.user.findUnique({ where: { email: body.email }, select: { id: true } });
          if (emailOwner && emailOwner.id !== targetId) throw new HttpError(409, 'EMAIL_ALREADY_REGISTERED', 'This email address is already used by another account.');
        }
        const profile = { fullName: body.fullName, ...(body.email ? { email: body.email, emailVerifiedAt: null } : {}), ...(preferredLanguageId ? { preferredLanguageId } : {}) };

        if (targetId) {
          await tx.user.update({ where: { id: targetId }, data: profile });
          return { id: targetId, upgradedDeviceAccount: Boolean(upgrade) };
        }
        const farmer = await tx.role.findUniqueOrThrow({ where: { code: 'FARMER' }, select: { id: true } });
        const created = await tx.user.create({
          data: { ...profile, phone: body.phone, status: 'PENDING_VERIFICATION', roles: { create: [{ roleId: farmer.id }] } },
          select: { id: true },
        });
        return { id: created.id, upgradedDeviceAccount: false };
      });

      const otp = await issueOtp(body.phone, 'REGISTRATION', target.id, body.language);
      return { status: 'PENDING_VERIFICATION' as const, upgradedDeviceAccount: target.upgradedDeviceAccount, otp };
    },

    /** Same response whether or not the number is registered (no user enumeration). */
    async sendOtp(body: SendOtpBody) {
      enabled();
      let userId: string | null = null;
      if (body.purpose === 'LOGIN') {
        const user = await prisma.user.findUnique({ where: { phone: body.phone }, select: { id: true, phoneVerifiedAt: true, status: true, deletedAt: true } });
        if (user && user.phoneVerifiedAt && user.status === 'ACTIVE' && !user.deletedAt) userId = user.id;
      } else {
        const pending = await prisma.phoneOtp.findFirst({
          where: { phone: body.phone, purpose: 'REGISTRATION', userId: { not: null } },
          orderBy: { sentAt: 'desc' },
          select: { user: { select: { id: true, phoneVerifiedAt: true, deletedAt: true } } },
        });
        if (pending?.user && !pending.user.phoneVerifiedAt && !pending.user.deletedAt) userId = pending.user.id;
      }
      const otp = await issueOtp(body.phone, body.purpose, userId);
      return { message: 'If this number can receive a code, it has been sent.', otp };
    },

    /** Completes registration: the phone becomes verified and the user is signed in. */
    async verifyRegistration(body: VerifyOtpBody) {
      const userId = await consumeOtp(body.phone, 'REGISTRATION', body.otp);
      const now = new Date();
      const user = await prisma.$transaction(async (tx) => {
        await lockPhone(tx, body.phone);
        const holder = await tx.user.findUnique({ where: { phone: body.phone }, select: { id: true, phoneVerifiedAt: true, status: true, isDeviceAccount: true } });
        if (holder && holder.id !== userId) {
          if (holder.phoneVerifiedAt || holder.status !== 'PENDING_VERIFICATION' || holder.isDeviceAccount) {
            throw new HttpError(409, 'PHONE_ALREADY_REGISTERED', 'This mobile number is already registered. Please log in instead.');
          }
          // An abandoned, never-verified registration for the same number: it has no data — remove it.
          await tx.user.delete({ where: { id: holder.id } });
        }
        const current = await tx.user.findUniqueOrThrow({ where: { id: userId }, select: { status: true, deletedAt: true, phone: true } });
        if (current.deletedAt) throw otpInvalid();
        if (current.phone && current.phone !== body.phone) {
          throw new HttpError(409, 'PHONE_CHANGE_NOT_SUPPORTED', 'This account already has a different mobile number.');
        }
        return tx.user.update({
          where: { id: userId },
          data: {
            phone: body.phone, phoneVerifiedAt: now, isDeviceAccount: false, lastLoginAt: now,
            status: current.status === 'PENDING_VERIFICATION' ? 'ACTIVE' : current.status,
          },
          select: { id: true, status: true },
        });
      });
      if (user.status !== 'ACTIVE') throw new HttpError(403, 'ACCOUNT_NOT_ACTIVE', 'This account is not active. Please contact support.');
      return { user: await signedInUser(user.id), tokens: await startSession(user.id, body.platform) };
    },

    async login(body: LoginBody) {
      const userId = await consumeOtp(body.phone, 'LOGIN', body.otp);
      const user = await prisma.user.findUnique({ where: { id: userId }, select: { status: true, phoneVerifiedAt: true, deletedAt: true, phone: true } });
      if (!user || user.deletedAt || user.phone !== body.phone || !user.phoneVerifiedAt) throw otpInvalid();
      if (user.status !== 'ACTIVE') throw new HttpError(403, 'ACCOUNT_NOT_ACTIVE', 'This account is not active. Please contact support.');
      await prisma.user.update({ where: { id: userId }, data: { lastLoginAt: new Date() } });
      return { user: await signedInUser(userId), tokens: await startSession(userId, body.platform) };
    },

    /** Rotates the refresh token. Re-using an old (rotated) token revokes the whole session family. */
    async refresh(refreshToken: string): Promise<TokenPair> {
      const { jwtSecret } = enabled();
      const invalid = () => new HttpError(401, 'INVALID_REFRESH_TOKEN', 'Please sign in again.');
      if (!REFRESH_TOKEN_FORMAT.test(refreshToken)) throw invalid();
      const session = await prisma.authSession.findUnique({
        where: { tokenHash: sha256Hex(refreshToken) },
        select: { id: true, userId: true, familyId: true, expiresAt: true, revokedAt: true, revokedReason: true, platform: true, user: { select: { status: true, deletedAt: true } } },
      });
      if (!session) throw invalid();
      if (session.revokedAt) {
        if (session.revokedReason === 'ROTATED') {
          await revokeFamily(session.familyId, 'REUSE_DETECTED');
          logger.warn({ userId: session.userId, familyId: session.familyId }, 'Refresh token re-use detected — session family revoked');
          throw new HttpError(401, 'REFRESH_TOKEN_REUSED', 'This sign-in is no longer valid. Please sign in again.');
        }
        throw invalid();
      }
      if (session.expiresAt.getTime() <= Date.now()) throw invalid();
      if (session.user.deletedAt || session.user.status !== 'ACTIVE') {
        await revokeFamily(session.familyId, 'ACCOUNT_DISABLED');
        throw new HttpError(403, 'ACCOUNT_NOT_ACTIVE', 'This account is not active. Please contact support.');
      }

      const next = newRefreshToken();
      const now = new Date();
      const expiresAt = new Date(now.getTime() + settings.refreshTokenTtlDays * DAY_MS);
      await prisma.$transaction(async (tx) => {
        const created = await tx.authSession.create({
          data: { userId: session.userId, familyId: session.familyId, tokenHash: sha256Hex(next), expiresAt, platform: session.platform },
          select: { id: true },
        });
        const rotated = await tx.authSession.updateMany({
          where: { id: session.id, revokedAt: null },
          data: { revokedAt: now, revokedReason: 'ROTATED', replacedById: created.id, lastUsedAt: now },
        });
        if (rotated.count === 0) throw invalid(); // another request rotated it first; this one is rolled back
      });
      return {
        tokenType: 'Bearer',
        accessToken: await signAccessToken(jwtSecret, { userId: session.userId, familyId: session.familyId }, settings.accessTokenTtlSeconds),
        expiresIn: settings.accessTokenTtlSeconds,
        refreshToken: next,
        refreshTokenExpiresAt: expiresAt.toISOString(),
      };
    },

    /** Idempotent: always succeeds, revoking the token's session family if it exists. */
    async logout(refreshToken: string) {
      if (!REFRESH_TOKEN_FORMAT.test(refreshToken)) return;
      const session = await prisma.authSession.findUnique({ where: { tokenHash: sha256Hex(refreshToken) }, select: { familyId: true } });
      if (session) await revokeFamily(session.familyId, 'LOGOUT');
    },

    /** Access token → user id, if the signature, expiry and session family are all valid. */
    async authenticateAccessToken(token: string): Promise<{ userId: string; familyId: string } | null> {
      if (!settings.jwtSecret) return null;
      const claims = await verifyAccessToken(settings.jwtSecret, token);
      if (!claims) return null;
      const active = await prisma.authSession.findFirst({
        where: { familyId: claims.familyId, userId: claims.userId, revokedAt: null, expiresAt: { gt: new Date() } },
        select: { id: true },
      });
      return active ? claims : null;
    },

    /** Revokes every session of a user (e.g. when an administrator suspends the account). */
    async revokeAllSessions(userId: string, reason: 'ACCOUNT_DISABLED' | 'ADMIN' = 'ADMIN') {
      await prisma.authSession.updateMany({ where: { userId, revokedAt: null }, data: { revokedAt: new Date(), revokedReason: reason } });
    },
  };
}
