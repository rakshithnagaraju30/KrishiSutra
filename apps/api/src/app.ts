/**
 * Builds the Express application. No network listening and no database connection happen here —
 * dependencies are passed in, so tests can create the app with a real or a simulated database check.
 *
 * Middleware order matters:
 *   request id + access log → security headers → CORS → JSON body (size-limited) → /api/v1 routes
 *   → 404 → central error handler
 */
import express, { type Express } from 'express';
import helmet from 'helmet';
import type { PrismaClient } from '../generated/prisma/client.ts';
import type { AppConfig } from './config/env.ts';
import type { Logger } from './config/logger.ts';
import { createDatabaseCheck, type DatabaseCheck } from './db/health.ts';
import { createCorsMiddleware } from './middleware/cors.ts';
import { createErrorHandler } from './middleware/error-handler.ts';
import { notFound } from './middleware/not-found.ts';
import { createRateLimiters } from './middleware/rate-limit.ts';
import { createRequestLogger } from './middleware/request-logger.ts';
import { createV1Router } from './routes/index.ts';
import { createServices } from './services/index.ts';

export const API_PREFIX = '/api/v1';

export type AppDependencies = {
  config: AppConfig;
  logger: Logger;
  /** The single Prisma Client (src/db/prisma.ts). */
  prisma: PrismaClient;
  /** Defaults to SELECT 1 through `prisma`. */
  checkDatabase?: DatabaseCheck;
  /** Reports whether the server is draining connections (graceful shutdown). */
  isShuttingDown?: () => boolean;
  /** HTTP client for external APIs; defaults to the global fetch. */
  fetchImpl?: typeof fetch;
};

export function createApp(deps: AppDependencies): Express {
  const { config, logger } = deps;
  const app = express();

  app.disable('x-powered-by');
  app.set('trust proxy', config.trustProxy);

  app.use(createRequestLogger(logger));
  app.use(helmet());
  app.use(createCorsMiddleware(config.corsAllowedOrigins));
  app.use(express.json({ limit: config.requestBodyLimit, strict: true }));

  const services = createServices({
    config,
    logger,
    prisma: deps.prisma,
    checkDatabase: deps.checkDatabase ?? createDatabaseCheck(deps.prisma),
    isShuttingDown: deps.isShuttingDown ?? (() => false),
    fetchImpl: deps.fetchImpl ?? fetch,
  });
  const limiters = createRateLimiters(config.rateLimit);
  app.use(API_PREFIX, createV1Router({ config, services, limiters }));

  app.use(notFound);
  app.use(createErrorHandler({ exposeStack: config.nodeEnv === 'development' }));

  return app;
}
