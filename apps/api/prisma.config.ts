// Prisma ORM 7 configuration. The connection string is read from the environment (.env locally,
// secrets in CI / production) — it is never written into the schema.
// process.env (not Prisma's env() helper) so that `npm install` → `prisma generate` also works on a
// machine with no DATABASE_URL yet; commands that need the database fail clearly without it.
import 'dotenv/config';
import { defineConfig } from 'prisma/config';

export default defineConfig({
  schema: 'prisma/schema',
  migrations: {
    path: 'prisma/migrations',
    seed: 'tsx prisma/seed/index.ts',
  },
  datasource: {
    url: process.env.DATABASE_URL,
  },
});
