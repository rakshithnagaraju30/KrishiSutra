/**
 * requireAuth — every farmer-data route uses it. Reads `Authorization: Bearer <token>`, resolves the
 * device account and sets req.auth. Missing/invalid token → 401 UNAUTHORIZED (no hint which part failed).
 */
import type { RequestHandler } from 'express';
import type { AuthService } from '../services/auth.service.ts';
import { HttpError } from '../utils/http-error.ts';

export function createRequireAuth(auth: AuthService): RequestHandler {
  return async (req, _res, next) => {
    const header = req.headers.authorization;
    const token = header?.startsWith('Bearer ') ? header.slice(7).trim() : undefined;
    const identity = token ? await auth.authenticate(token) : null;
    if (!identity) {
      next(new HttpError(401, 'UNAUTHORIZED', 'Sign-in required.'));
      return;
    }
    req.auth = identity;
    next();
  };
}

/** For handlers behind requireAuth. */
export function currentUserId(req: { auth?: { userId: string } }): string {
  if (!req.auth) throw new HttpError(401, 'UNAUTHORIZED', 'Sign-in required.');
  return req.auth.userId;
}
