/**
 * Consistent JSON response shapes for every endpoint.
 *
 *   success: { "success": true,  "data": { ... } }
 *   error:   { "success": false, "error": { "code", "message", "details"?, "requestId"? } }
 *
 * Every response also carries an `X-Request-Id` header (see middleware/request-logger.ts).
 */
import type { Response } from 'express';

export type SuccessBody<T> = { success: true; data: T };

export type ErrorBody = {
  success: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
    requestId?: string;
    /** Only in development, only for unexpected (500) errors. */
    stack?: string;
  };
};

export function sendSuccess<T>(res: Response, data: T, status = 200): void {
  const body: SuccessBody<T> = { success: true, data };
  res.status(status).json(body);
}
