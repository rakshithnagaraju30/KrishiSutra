/**
 * Access tokens: short-lived JWT (HS256) — claims sub (user id), fam (session family), typ "access",
 * iss/aud fixed, exp. No roles inside: permissions are read from the database on every request.
 * Refresh tokens: opaque random strings (`ks_rt_` + 256 bits); only their SHA-256 is stored.
 */
import { createHash, randomBytes } from 'node:crypto';
import { errors, jwtVerify, SignJWT } from 'jose';

export const JWT_ISSUER = 'krishisutra-api';
export const JWT_AUDIENCE = 'krishisutra-app';
const REFRESH_PREFIX = 'ks_rt_';
export const REFRESH_TOKEN_FORMAT = /^ks_rt_[A-Za-z0-9_-]{43}$/;

export function sha256Hex(value: string): string {
  return createHash('sha256').update(value).digest('hex');
}

export function newRefreshToken(): string {
  return REFRESH_PREFIX + randomBytes(32).toString('base64url');
}

export async function signAccessToken(secret: Uint8Array, claims: { userId: string; familyId: string }, ttlSeconds: number): Promise<string> {
  return new SignJWT({ typ: 'access', fam: claims.familyId })
    .setProtectedHeader({ alg: 'HS256', typ: 'JWT' })
    .setSubject(claims.userId)
    .setIssuer(JWT_ISSUER)
    .setAudience(JWT_AUDIENCE)
    .setIssuedAt()
    .setExpirationTime(`${ttlSeconds}s`)
    .sign(secret);
}

export type AccessClaims = { userId: string; familyId: string };

/** Verifies signature, algorithm, issuer, audience, expiry and token type. Returns null if anything is wrong. */
export async function verifyAccessToken(secret: Uint8Array, token: string): Promise<AccessClaims | null> {
  try {
    const { payload } = await jwtVerify(token, secret, { algorithms: ['HS256'], issuer: JWT_ISSUER, audience: JWT_AUDIENCE });
    if (payload.typ !== 'access' || typeof payload.sub !== 'string' || typeof payload.fam !== 'string') return null;
    return { userId: payload.sub, familyId: payload.fam };
  } catch (error) {
    if (error instanceof errors.JOSEError) return null;
    throw error;
  }
}
