/**
 * Database reachability check (`SELECT 1`) with a time limit, so a hung or unreachable database
 * produces a clear failure instead of a request that never finishes.
 * Used at startup (server.ts) and by GET /api/v1/health/database.
 */
import type { PrismaClient } from '../../generated/prisma/client.ts';

export type DatabaseHealth = { latencyMs: number };
export type DatabaseCheck = () => Promise<DatabaseHealth>;

export class DatabaseCheckTimeoutError extends Error {
  constructor(timeoutMs: number) {
    super(`Database did not respond within ${timeoutMs} ms`);
    this.name = 'DatabaseCheckTimeoutError';
  }
}

export function createDatabaseCheck(prisma: Pick<PrismaClient, '$queryRaw'>, timeoutMs = 3000): DatabaseCheck {
  return async () => {
    const started = performance.now();
    let timer: NodeJS.Timeout | undefined;
    const timeout = new Promise<never>((_, reject) => {
      timer = setTimeout(() => reject(new DatabaseCheckTimeoutError(timeoutMs)), timeoutMs);
    });
    try {
      await Promise.race([prisma.$queryRaw`SELECT 1`, timeout]);
    } finally {
      clearTimeout(timer);
    }
    return { latencyMs: Math.round(performance.now() - started) };
  };
}
