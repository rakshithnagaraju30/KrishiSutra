/**
 * The ONE Prisma Client for the backend process.
 *
 * Every module (API routes, seed scripts, tests) imports `prisma` from here, so the app holds a
 * single connection pool. In development, the instance is cached on globalThis so hot reloads do
 * not open a new pool each time.
 */
import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../../generated/prisma/client.ts';

function createClient(): PrismaClient {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error('DATABASE_URL is not set. Copy .env.example to .env and fill it in.');
  }
  const adapter = new PrismaPg({
    connectionString,
    // Without this, pg waits forever for a connection when the database is unreachable.
    connectionTimeoutMillis: Number(process.env.DATABASE_CONNECT_TIMEOUT_MS ?? 5000),
  });
  return new PrismaClient({
    adapter,
    log:
      process.env.PRISMA_LOG_QUERIES === 'true'
        ? ['query', 'warn', 'error']
        : process.env.NODE_ENV === 'test'
          ? ['warn'] // negative tests trigger expected constraint errors
          : process.env.NODE_ENV === 'production'
            ? ['warn'] // errors are logged safely by the API's error handler (Prisma messages can contain query values)
            : ['warn', 'error'],
  });
}

const globalForPrisma = globalThis as unknown as { __krishisutraPrisma?: PrismaClient };

export const prisma: PrismaClient = globalForPrisma.__krishisutraPrisma ?? createClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.__krishisutraPrisma = prisma;
}

export type { PrismaClient };
