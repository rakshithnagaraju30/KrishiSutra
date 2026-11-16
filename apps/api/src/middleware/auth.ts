/**
 * Authentication and authorisation middleware — the ONE place that decides who is calling.
 *
 *   requireAuth          → accepts `Authorization: Bearer <token>`:
 *                            - a JWT access token (phone sign-in, Part 3.2), or
 *                            - a device token `ks_dev_…` (no-login app accounts, kept for app v0.2.0).
 *                          Loads the user's status and roles FROM THE DATABASE on every request and sets
 *                          req.auth. Missing/invalid token → 401 UNAUTHORIZED; account not ACTIVE → 403.
 *   requireRole(...codes) → after requireAuth: 403 FORBIDDEN unless the user has one of the roles.
 *   currentUserId(req)    → the authenticated user id for controllers.
 *
 * Roles never come from the request or from the token, so a client cannot grant itself permissions.
 */
import type { RequestHandler } from 'express';
import type { PrismaClient } from '../../generated/prisma/client.ts';
import type { AuthService } from '../services/auth.service.ts';
import type { PhoneAuthService } from '../services/phone-auth.service.ts';
import { HttpError } from '../utils/http-error.ts';

export type AuthIdentity = {
  userId: string;
  method: 'jwt' | 'device';
  /** Role codes read from the database for this request, e.g. ["FARMER"]. */
  roles: string[];
  /** Session family of a JWT (phone sign-in). */
  familyId?: string;
  /** DeviceCredential id of a device token. */
  credentialId?: string;
};

const unauthorized = () => new HttpError(401, 'UNAUTHORIZED', 'Sign-in required.');

export function bearerToken(header: string | undefined): string | null {
  const token = header?.startsWith('Bearer ') ? header.slice(7).trim() : '';
  return token.length > 0 && token.length <= 2048 ? token : null;
}

export function createRequireAuth(deps: { prisma: PrismaClient; device: AuthService; phone: PhoneAuthService }): RequestHandler {
  return async (req, _res, next) => {
    const token = bearerToken(req.headers.authorization);
    if (!token) return next(unauthorized());

    let identity: { userId: string; method: 'jwt' | 'device'; familyId?: string; credentialId?: string } | null = null;
    if (token.startsWith('ks_dev_')) {
      const device = await deps.device.authenticate(token);
      if (device) identity = { userId: device.userId, method: 'device', credentialId: device.credentialId };
    } else {
      const claims = await deps.phone.authenticateAccessToken(token);
      if (claims) identity = { userId: claims.userId, method: 'jwt', familyId: claims.familyId };
    }
    if (!identity) return next(unauthorized());

    const user = await deps.prisma.user.findUnique({
      where: { id: identity.userId },
      select: { status: true, deletedAt: true, roles: { select: { role: { select: { code: true } } } } },
    });
    if (!user || user.deletedAt) return next(unauthorized());
    if (user.status !== 'ACTIVE') return next(new HttpError(403, 'ACCOUNT_NOT_ACTIVE', 'This account is not active. Please contact support.'));

    req.auth = { ...identity, roles: user.roles.map((r) => r.role.code) };
    next();
  };
}

/** Allows the request only if the signed-in user has at least one of the given roles. */
export function requireRole(...roles: string[]): RequestHandler {
  return (req, _res, next) => {
    if (!req.auth) return next(unauthorized());
    if (!req.auth.roles.some((r) => roles.includes(r))) {
      return next(new HttpError(403, 'FORBIDDEN', 'You do not have permission to do this.'));
    }
    next();
  };
}

/** For handlers behind requireAuth. */
export function currentUserId(req: { auth?: { userId: string } }): string {
  if (!req.auth) throw unauthorized();
  return req.auth.userId;
}
