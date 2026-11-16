/**
 * Rate limits (in-memory; fine for a single instance — use a shared store when scaling out).
 * - api: general ceiling per client IP.
 * - registration: device account creation, to prevent mass account creation.
 * - otp: phone sign-in endpoints (register, send-otp, verify-otp, login) per client IP. Per-number
 *   cooldowns and caps are enforced in the service as well.
 * Behind Render / a load balancer, TRUST_PROXY must be set so the real client IP is used.
 */
import { rateLimit } from 'express-rate-limit';
import { HttpError } from '../utils/http-error.ts';

export type RateLimitOptions = { apiPerMinute: number; registrationsPerHour: number; otpRequestsPerHour: number };

function limiter(windowMs: number, limit: number, message: string) {
  return rateLimit({
    windowMs,
    limit,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    handler: (_req, _res, next) => next(new HttpError(429, 'RATE_LIMITED', message)),
  });
}

export type RateLimiters = ReturnType<typeof createRateLimiters>;

export function createRateLimiters(options: RateLimitOptions) {
  return {
    api: limiter(60_000, options.apiPerMinute, 'Too many requests. Please wait a minute and try again.'),
    registration: limiter(60 * 60_000, options.registrationsPerHour, 'Too many new accounts from this network. Try again later.'),
    otp: limiter(60 * 60_000, options.otpRequestsPerHour, 'Too many sign-in attempts from this network. Please try again later.'),
  };
}
