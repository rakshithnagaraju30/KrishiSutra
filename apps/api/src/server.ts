/**
 * Process entry point: validate configuration → check the database → listen → shut down gracefully.
 *
 * The server never reports "started" unless the database answered. On SIGTERM/SIGINT it stops
 * accepting connections, lets in-flight requests finish (up to SHUTDOWN_TIMEOUT_MS), disconnects
 * Prisma and exits 0. Fatal startup problems exit with code 1 and a clear log line.
 */
import 'dotenv/config';
import type { AddressInfo } from 'node:net';
import { createApp } from './app.ts';
import { ConfigError, loadConfig, type AppConfig } from './config/env.ts';
import { createLogger, errorForLog } from './config/logger.ts';
import { createDatabaseCheck } from './db/health.ts';

const SHUTDOWN_TIMEOUT_MS = 10_000;

async function main(): Promise<void> {
  let config: AppConfig;
  try {
    config = loadConfig(process.env);
  } catch (error) {
    if (error instanceof ConfigError) {
      // Logger is not configured yet; print a plain, readable message.
      console.error(`[krishisutra-api] ${error.message}\nSee apps/api/.env.example.`);
      process.exit(1);
    }
    throw error;
  }

  const logger = createLogger(config);

  // Imported only after configuration is valid (the module creates the client on import).
  const { prisma } = await import('./db/prisma.ts');
  const checkDatabase = createDatabaseCheck(prisma);

  try {
    const { latencyMs } = await checkDatabase();
    logger.info({ latencyMs }, 'Database connection OK');
  } catch (error) {
    logger.fatal({ err: errorForLog(error) }, 'Cannot reach the database — the server will not start');
    await prisma.$disconnect().catch(() => undefined);
    process.exit(1);
  }

  let shuttingDown = false;
  const app = createApp({ config, logger, prisma, checkDatabase, isShuttingDown: () => shuttingDown });
  const server = app.listen(config.port, config.host);

  server.on('listening', () => {
    const { port } = server.address() as AddressInfo;
    logger.info({ host: config.host, port }, `KrishiSutra API listening on http://${config.host}:${port}/api/v1`);
  });

  async function shutdown(reason: string, exitCode: number): Promise<void> {
    if (shuttingDown) return;
    shuttingDown = true;
    logger.info({ reason }, 'Shutting down');
    const force = setTimeout(() => {
      logger.error('Graceful shutdown timed out — forcing exit');
      process.exit(1);
    }, SHUTDOWN_TIMEOUT_MS);
    force.unref();

    await new Promise<void>((resolve) => {
      server.close(() => resolve());
      server.closeIdleConnections();
    });
    await prisma.$disconnect().catch((error: unknown) => logger.error({ err: errorForLog(error) }, 'Error while disconnecting Prisma'));
    logger.info('Shutdown complete');
    clearTimeout(force);
    process.exit(exitCode);
  }

  server.on('error', (error) => {
    logger.fatal({ err: errorForLog(error) }, 'HTTP server error (is the port already in use?)');
    void shutdown('server-error', 1);
  });
  process.on('SIGTERM', () => void shutdown('SIGTERM', 0));
  process.on('SIGINT', () => void shutdown('SIGINT', 0));
  process.on('unhandledRejection', (reason) => {
    logger.fatal({ err: errorForLog(reason) }, 'Unhandled promise rejection');
    void shutdown('unhandledRejection', 1);
  });
  process.on('uncaughtException', (error) => {
    logger.fatal({ err: errorForLog(error) }, 'Uncaught exception');
    void shutdown('uncaughtException', 1);
  });
}

void main();
