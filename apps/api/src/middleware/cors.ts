/**
 * CORS with an explicit allow-list (CORS_ALLOWED_ORIGINS).
 *
 * - Browsers (the web app) must come from a listed origin; anything else gets 403 CORS_ORIGIN_NOT_ALLOWED.
 * - Requests without an Origin header (the Android/iOS app, server-to-server calls, curl) are not
 *   browser cross-origin requests and are allowed; authentication (Part 3.2+) protects them.
 * - No cookies are used (credentials: false); tokens will travel in the Authorization header.
 */
import cors from 'cors';
import { HttpError } from '../utils/http-error.ts';

export function createCorsMiddleware(allowedOrigins: readonly string[]) {
  const allowed = new Set(allowedOrigins);
  return cors({
    origin(origin, callback) {
      if (!origin || allowed.has(origin)) {
        callback(null, true);
        return;
      }
      callback(new HttpError(403, 'CORS_ORIGIN_NOT_ALLOWED', 'This origin is not allowed to call the API.'));
    },
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept-Language', 'X-Request-Id'],
    exposedHeaders: ['X-Request-Id'],
    credentials: false,
    maxAge: 600,
  });
}
