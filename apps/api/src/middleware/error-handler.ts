/**
 * Central error handler — the only place that turns errors into HTTP responses.
 *
 * Known error kinds get a precise status + code; anything unexpected becomes
 * 500 INTERNAL_ERROR with a generic message. Stack traces are included in the response only when
 * `exposeStack` is true (development), never in test or production. Unexpected errors are logged
 * with the request id (safely — see errorForLog).
 */
import type { ErrorRequestHandler } from 'express';
import { ZodError } from 'zod';
import { errorForLog } from '../config/logger.ts';
import { HttpError } from '../utils/http-error.ts';
import type { ErrorBody } from '../utils/response.ts';

type Normalized = { status: number; code: string; message: string; details?: unknown; unexpected: boolean };

/** Errors raised by express.json() (body-parser) carry a `type` and an HTTP `status`. */
type BodyParserError = Error & { type?: string; status?: number; expose?: boolean };

/** Prisma errors are recognised by name/code without importing Prisma internals. */
type PrismaLikeError = Error & { code?: string };

export function normalizeError(error: unknown): Normalized {
  if (error instanceof HttpError) {
    return { status: error.status, code: error.code, message: error.message, details: error.details, unexpected: false };
  }

  if (error instanceof ZodError) {
    return {
      status: 400,
      code: 'VALIDATION_ERROR',
      message: 'Request validation failed.',
      details: error.issues.map((i) => ({ path: i.path.join('.'), message: i.message, code: i.code })),
      unexpected: false,
    };
  }

  if (error instanceof Error) {
    const bp = error as BodyParserError;
    switch (bp.type) {
      case 'entity.parse.failed':
        return { status: 400, code: 'INVALID_JSON', message: 'The request body is not valid JSON.', unexpected: false };
      case 'entity.too.large':
        return { status: 413, code: 'PAYLOAD_TOO_LARGE', message: 'The request body is too large.', unexpected: false };
      case 'encoding.unsupported':
      case 'charset.unsupported':
        return { status: 415, code: 'UNSUPPORTED_MEDIA_TYPE', message: 'Unsupported request body encoding.', unexpected: false };
      default:
        break;
    }
    if (bp.expose && typeof bp.status === 'number' && bp.status >= 400 && bp.status < 500) {
      return { status: bp.status, code: 'BAD_REQUEST', message: 'The request could not be processed.', unexpected: false };
    }

    const prismaError = error as PrismaLikeError;
    if (prismaError.name === 'PrismaClientKnownRequestError') {
      if (prismaError.code === 'P2002') return { status: 409, code: 'CONFLICT', message: 'A record with these values already exists.', unexpected: false };
      if (prismaError.code === 'P2025') return { status: 404, code: 'NOT_FOUND', message: 'The requested record was not found.', unexpected: false };
      if (prismaError.code === 'P2003') return { status: 409, code: 'CONFLICT', message: 'The operation conflicts with related records.', unexpected: false };
    }
  }

  return { status: 500, code: 'INTERNAL_ERROR', message: 'An unexpected error occurred.', unexpected: true };
}

export function createErrorHandler(options: { exposeStack: boolean }): ErrorRequestHandler {
  return (error, req, res, next) => {
    if (res.headersSent) {
      next(error);
      return;
    }
    const normalized = normalizeError(error);
    const requestId = typeof req.id === 'string' ? req.id : req.id !== undefined ? String(req.id) : undefined;

    if (normalized.unexpected) {
      req.log?.error({ err: errorForLog(error) }, 'Unexpected error while handling request');
    }

    const body: ErrorBody = {
      success: false,
      error: {
        code: normalized.code,
        message: normalized.message,
        ...(normalized.details !== undefined ? { details: normalized.details } : {}),
        ...(requestId ? { requestId } : {}),
        ...(options.exposeStack && normalized.unexpected && error instanceof Error && error.stack ? { stack: error.stack } : {}),
      },
    };
    res.status(normalized.status).json(body);
  };
}
