# KrishiSutra — API & database

Backend package: **Express.js 5 + TypeScript** on **PostgreSQL 16** via **Prisma ORM 7**.

- **Part 2 (done):** database — schema, migrations, seed, tests → [docs/database/03-database-architecture.md](../../docs/database/03-database-architecture.md)
- **Part 3.1 (done):** backend foundation — config, logging, errors, health endpoints → [docs/backend/05-backend-foundation.md](../../docs/backend/05-backend-foundation.md)
- Business endpoints (farms, crops, recommendations, tracking) start in Part 3.2.

## Quick start

Requires Node.js 22+ and PostgreSQL 16.

```bash
cp .env.example .env            # set DATABASE_URL (and CORS_ALLOWED_ORIGINS for the web app)
docker compose up -d            # optional: local PostgreSQL 16
npm install                     # also generates Prisma Client into ./generated
npm run db:deploy               # apply migrations
npm run db:seed                 # reference + demonstration data
npm run dev                     # http://localhost:3000/api/v1  (reloads on change)
npm test                        # all tests
```

## Endpoints (v1)

| Method | Path | Purpose |
|---|---|---|
| GET | `/api/v1` | API information |
| GET | `/api/v1/health` | Application health (503 while shutting down) |
| GET | `/api/v1/health/database` | Database connectivity (503 `DATABASE_UNAVAILABLE` on failure) |

Responses: `{ "success": true, "data": … }` or `{ "success": false, "error": { "code", "message", "details"?, "requestId" } }`.
Examples and the full error-code list: [docs/backend/05-backend-foundation.md §8](../../docs/backend/05-backend-foundation.md#8-endpoints).

## Layout

```
src/
  app.ts  server.ts
  config/       env validation (zod) · logger (pino)
  routes/       URL → middleware + controller
  controllers/  HTTP in/out only
  services/     logic
  middleware/   request id/logging · CORS · validation · 404 · error handler
  utils/        HttpError · response helpers
  db/           the single Prisma Client · ownership filters · health check
prisma/         schema/ (one file per module) · migrations/ · seed/
tests/          api/ (backend foundation) · database.test.ts (database)
```

## Scripts

| Script | What it does |
|---|---|
| `dev` | Development server with reload (`tsx watch`) |
| `build` / `start` | Compile to `dist/` / run `node dist/src/server.js` (production) |
| `test` / `typecheck` | All tests / TypeScript check |
| `db:migrate` | Create/apply a migration after editing `prisma/schema/*.prisma`, then regenerate the client |
| `db:deploy` | Apply pending migrations (CI / production) |
| `db:seed` | Seed (safe to run repeatedly) |
| `db:status` | Migration status |
| `db:reset` | **Development only** — drop, re-migrate, re-seed |
| `db:er` | Regenerate the ER diagrams from the database |
| `db:studio` | Browse data in Prisma Studio |
| `prisma:validate` / `prisma:format` / `prisma:generate` | Schema tooling |

## Environment variables

See [.env.example](.env.example). Required: `DATABASE_URL`; in production also `CORS_ALLOWED_ORIGINS`.
The server validates everything at startup and refuses to start (exit code 1) with a list of problems.
Never commit `.env`.

Seed data is **demonstration content only** (DRAFT, UNVERIFIED, no agronomic values).
