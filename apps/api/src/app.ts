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
import type { AppConfig } from './config/env.ts';
import type { Logger } from './config/logger.ts';
import type { DatabaseCheck } from './db/health.ts';
import { createCorsMiddleware } from './middleware/cors.ts';
import { createErrorHandler } from './middleware/error-handler.ts';
import { notFound } from './middleware/not-found.ts';
import { createRequestLogger } from './middleware/request-logger.ts';
import { createV1Router } from './routes/index.ts';
import { createHealthService } from './services/health.service.ts';

export const API_PREFIX = '/api/v1';

export type AppDependencies = {
  config: AppConfig;
  logger: Logger;
  checkDatabase: DatabaseCheck;
  /** Reports whether the server is draining connections (graceful shutdown). */
  isShuttingDown?: () => boolean;
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

  const health = createHealthService({
    config,
    logger,
    checkDatabase: deps.checkDatabase,
    isShuttingDown: deps.isShuttingDown ?? (() => false),
  });
  app.use(API_PREFIX, createV1Router({ config, health }));

  app.use(notFound);
  app.use(createErrorHandler({ exposeStack: config.nodeEnv === 'development' }));

  return app;
}
