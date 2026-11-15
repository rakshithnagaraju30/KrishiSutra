/**
 * Health information. Services hold the logic; controllers only translate HTTP ↔ service calls.
 */
import type { AppConfig } from '../config/env.ts';
import { errorForLog, type Logger } from '../config/logger.ts';
import type { DatabaseCheck } from '../db/health.ts';
import { HttpError } from '../utils/http-error.ts';

export const API_VERSION = 'v1';

export type HealthService = ReturnType<typeof createHealthService>;

export function createHealthService(deps: {
  config: Pick<AppConfig, 'nodeEnv' | 'appVersion'>;
  logger: Logger;
  checkDatabase: DatabaseCheck;
  isShuttingDown: () => boolean;
  startedAt?: Date;
}) {
  const startedAt = deps.startedAt ?? new Date();

  return {
    /** Liveness: the process is up and serving requests. */
    getStatus() {
      return {
        status: deps.isShuttingDown() ? ('shutting_down' as const) : ('ok' as const),
        environment: deps.config.nodeEnv,
        apiVersion: API_VERSION,
        version: deps.config.appVersion,
        timestamp: new Date().toISOString(),
        uptimeSeconds: Math.round((Date.now() - startedAt.getTime()) / 1000),
      };
    },

    /** Readiness of the database. Throws 503 DATABASE_UNAVAILABLE (details are logged, never returned). */
    async getDatabaseStatus() {
      try {
        const { latencyMs } = await deps.checkDatabase();
        return { status: 'ok' as const, database: 'postgresql', latencyMs, timestamp: new Date().toISOString() };
      } catch (error) {
        deps.logger.warn({ err: errorForLog(error) }, 'Database health check failed');
        throw new HttpError(503, 'DATABASE_UNAVAILABLE', 'The database is not reachable.');
      }
    },
  };
}
