/**
 * Device ("no login") accounts — interim sign-in chosen by the product owner.
 *
 * Registration creates a FARMER user (isDeviceAccount = true) and returns a random 256-bit bearer
 * token ONCE. Only its SHA-256 hash is stored, so a database leak does not reveal usable tokens.
 * Phone-number login (ADR 0009) can later be linked to the same user, keeping all data.
 */
import { createHash, randomBytes } from 'node:crypto';
import type { PrismaClient } from '../../generated/prisma/client.ts';
import { HttpError } from '../utils/http-error.ts';
import type { LanguageCode } from '../utils/language.ts';
import type { RegisterDeviceBody, UpdateMeBody } from '../validators/auth.schemas.ts';

const TOKEN_PREFIX = 'ks_dev_';
const TOKEN_FORMAT = /^ks_dev_[A-Za-z0-9_-]{43}$/;
/** Avoid a database write on every request: refresh lastUsedAt at most hourly. */
const LAST_USED_REFRESH_MS = 60 * 60 * 1000;

export function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

export type AuthService = ReturnType<typeof createAuthService>;

export function createAuthService(prisma: PrismaClient) {
  async function languageId(code: LanguageCode | undefined) {
    if (!code) return undefined;
    const lang = await prisma.language.findUnique({ where: { code }, select: { id: true } });
    return lang?.id;
  }

  async function profile(userId: string) {
    const user = await prisma.user.findUniqueOrThrow({
      where: { id: userId },
      select: { id: true, fullName: true, isDeviceAccount: true, createdAt: true, preferredLanguage: { select: { code: true } } },
    });
    return {
      id: user.id,
      fullName: user.fullName,
      isDeviceAccount: user.isDeviceAccount,
      language: user.preferredLanguage?.code ?? null,
      createdAt: user.createdAt,
    };
  }

  return {
    async registerDevice(input: RegisterDeviceBody) {
      const token = TOKEN_PREFIX + randomBytes(32).toString('base64url');
      const farmerRole = await prisma.role.findUnique({ where: { code: 'FARMER' }, select: { id: true } });
      if (!farmerRole) throw new Error('FARMER role is missing — run the seed');
      const preferredLanguageId = await languageId(input.language);

      const user = await prisma.$transaction(async (tx) => {
        const created = await tx.user.create({
          data: {
            fullName: input.fullName ?? 'Farmer',
            isDeviceAccount: true,
            status: 'ACTIVE',
            preferredLanguageId,
            roles: { create: [{ roleId: farmerRole.id }] },
          },
        });
        await tx.deviceCredential.create({
          data: { userId: created.id, tokenHash: hashToken(token), platform: input.platform, deviceLabel: input.deviceLabel, lastUsedAt: new Date() },
        });
        return created;
      });

      return { token, user: await profile(user.id) };
    },

    /** Returns the identity for a bearer token, or null if it is unknown, revoked or the user is inactive. */
    async authenticate(token: string): Promise<{ userId: string; credentialId: string } | null> {
      if (!TOKEN_FORMAT.test(token)) return null;
      const credential = await prisma.deviceCredential.findUnique({
        where: { tokenHash: hashToken(token) },
        select: { id: true, userId: true, revokedAt: true, lastUsedAt: true, user: { select: { status: true, deletedAt: true } } },
      });
      if (!credential || credential.revokedAt || credential.user.deletedAt || credential.user.status !== 'ACTIVE') return null;
      if (!credential.lastUsedAt || Date.now() - credential.lastUsedAt.getTime() > LAST_USED_REFRESH_MS) {
        await prisma.deviceCredential.update({ where: { id: credential.id }, data: { lastUsedAt: new Date() } });
      }
      return { userId: credential.userId, credentialId: credential.id };
    },

    getProfile: profile,

    async updateProfile(userId: string, input: UpdateMeBody) {
      const preferredLanguageId = await languageId(input.language);
      if (input.language && !preferredLanguageId) throw new HttpError(400, 'VALIDATION_ERROR', 'Unknown language.');
      await prisma.user.update({
        where: { id: userId },
        data: { ...(input.fullName ? { fullName: input.fullName } : {}), ...(preferredLanguageId ? { preferredLanguageId } : {}) },
      });
      return profile(userId);
    },
  };
}
