/**
 * Structured JSON logging (pino). One logger per process; each request gets a child logger with its
 * request id (see middleware/request-logger.ts).
 *
 * Sensitive data: request/response bodies and headers are NOT logged. As a second line of defence,
 * common secret-bearing fields are redacted wherever they appear.
 */
import { pino, type Logger } from 'pino';
import type { AppConfig } from './env.ts';

export type { Logger };

export const REDACT_PATHS = [
  'req.headers.authorization',
  'req.headers.cookie',
  'res.headers["set-cookie"]',
  'password',
  '*.password',
  'passwordHash',
  '*.passwordHash',
  'token',
  '*.token',
  'otp',
  '*.otp',
  'databaseUrl',
  '*.databaseUrl',
  'DATABASE_URL',
];

export function createLogger(config: Pick<AppConfig, 'logLevel' | 'nodeEnv' | 'appVersion'>): Logger {
  return pino({
    level: config.logLevel,
    base: { service: 'krishisutra-api', env: config.nodeEnv, version: config.appVersion },
    timestamp: pino.stdTimeFunctions.isoTime,
    redact: { paths: REDACT_PATHS, censor: '[REDACTED]' },
  });
}

/** Remove connection strings from any text before it is logged. */
export function scrubSecrets(text: string): string {
  return text.replace(/postgres(ql)?:\/\/[^\s'"]+/gi, 'postgresql://[REDACTED]');
}

/**
 * Safe representation of an error for logs.
 * Prisma error messages can contain query arguments (user data), so for Prisma errors only the
 * type, code and model are logged.
 */
export function errorForLog(error: unknown): Record<string, unknown> {
  if (!(error instanceof Error)) return { type: typeof error, value: scrubSecrets(String(error)) };
  const err = error as Error & { code?: unknown; meta?: { modelName?: unknown } };
  if (err.name.startsWith('PrismaClient')) {
    return { type: err.name, code: err.code, model: err.meta?.modelName };
  }
  return {
    type: err.name,
    code: typeof err.code === 'string' ? err.code : undefined,
    message: scrubSecrets(err.message),
    stack: err.stack ? scrubSecrets(err.stack) : undefined,
  };
}
