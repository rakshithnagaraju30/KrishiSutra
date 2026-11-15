# KrishiSutra — Backend Foundation (Part 3.1)

| Item | Value |
|---|---|
| Document | 05 — Backend foundation |
| Phase | Part 3.1 — infrastructure only (no business APIs) |
| Status | Complete — awaiting approval for Part 3.2 |
| Last updated | 2026-11-15 |
| Code | [`apps/api/src/`](../../apps/api/src) |
| Builds on | [ADR 0013 — Express + Prisma](../adr/0013-express-and-prisma.md) · [03 — Database Architecture](../database/03-database-architecture.md) |

---

## 1. Assessment of the existing repository (before this phase)

| Area | Found |
|---|---|
| Frontend | `apps/mobile/` — Expo SDK 58 prototype (Expo Router, kn/hi/en, Android APK via GitHub Actions). **Not touched.** |
| Backend package | `apps/api/` (`@krishisutra/api`, ESM, TypeScript, Node ≥ 22) already existed for the database: Prisma 7.10.1 multi-file schema (75 models), 2 migrations, idempotent seed, 36 integration tests, ER generator. |
| Database access | One Prisma Client in `apps/api/src/db/prisma.ts` (driver adapter `@prisma/adapter-pg`), ownership filters in `src/db/ownership.ts`. |
| HTTP server | **None** — no Express, no routes. |
| Config | `prisma.config.ts` (reads `DATABASE_URL`), `.env.example` (DATABASE_URL only), `.env` git-ignored in `apps/api/.gitignore`; no repository-level `.gitignore`. |
| CI | `android-apk.yml` (mobile), `api-database.yml` (migrate, drift check, seed, tests). |
| Decisions | ADR 0013: Express.js + Prisma; ADR 0003's modular structure still applies. |

**Decision:** build the backend **inside `apps/api`** rather than a new `backend/` folder. The Prisma schema, generated client, migrations and tests already live there; a second package would duplicate the Prisma setup and the database connection.

---

## 2. Architecture

```
HTTP request
  │
  ▼
app.ts ─ request id + access log (pino-http)
       ─ security headers (helmet)
       ─ CORS allow-list
       ─ JSON body parser (size-limited)
       ─ /api/v1 ─► routes/ ─► controllers/ ─► services/ ─► db/ (Prisma) ─► PostgreSQL
       ─ 404 handler
       ─ central error handler ─► { success:false, error:{ code, message, details?, requestId } }

server.ts ─ load .env → validate config (zod) → check database → listen → graceful shutdown
```

**Layer rules**

| Layer | Does | Must not |
|---|---|---|
| `routes/` | Map URL + method → middleware (validation) + controller | Contain logic |
| `controllers/` | Read the request, call a service, send the response (`sendSuccess`) | Talk to Prisma directly |
| `services/` | Business logic; throw `HttpError` for expected failures | Know about `req`/`res` |
| `db/` (and, from 3.2, `repositories/`) | Data access through the single Prisma Client | Build HTTP responses |

`createApp()` receives its dependencies (config, logger, database check), so tests build the real app with a real or a simulated database without opening a port.

---

## 3. Folder structure (`apps/api/`)

```
apps/api/
├── src/
│   ├── app.ts                  Express app factory (middleware order, /api/v1 mount, 404, errors)
│   ├── server.ts               Entry point: config → DB check → listen → graceful shutdown
│   ├── config/
│   │   ├── env.ts              Environment validation (zod) → typed AppConfig; ConfigError
│   │   └── logger.ts           pino logger, redaction, safe error serialisation
│   ├── controllers/
│   │   ├── api-info.controller.ts   GET /api/v1
│   │   └── health.controller.ts     GET /api/v1/health, /health/database
│   ├── services/
│   │   └── health.service.ts   Health logic (status, DB readiness → 503 on failure)
│   ├── routes/
│   │   ├── index.ts            v1 router (each module adds one sub-router here)
│   │   └── health.routes.ts
│   ├── middleware/
│   │   ├── request-logger.ts   Request id (X-Request-Id) + one access-log line per request
│   │   ├── cors.ts             CORS allow-list
│   │   ├── validate.ts         zod request validation (params / query / body)
│   │   ├── not-found.ts        404 in the standard error format
│   │   └── error-handler.ts    Central error → response mapping
│   ├── utils/
│   │   ├── http-error.ts       HttpError(status, code, message, details)
│   │   └── response.ts         sendSuccess + response body types
│   └── db/                     (existing) prisma.ts · ownership.ts · health.ts (new: SELECT 1 with timeout)
├── tests/
│   ├── api/                    NEW: env.test.ts · app.test.ts · server.test.ts
│   ├── database.test.ts        (existing) 36 database tests
│   └── helpers.ts
├── prisma/ …                   (unchanged schema, migrations, seed)
├── tsconfig.json               Type-checking (no emit)
├── tsconfig.build.json         NEW: production build → dist/
└── .env.example
```

**Not created yet (on purpose):** `repositories/` and `validators/` — they would be empty in this phase. They arrive with the first business module in Part 3.2 (`repositories/<module>.repository.ts` for Prisma queries, `validators/<module>.schemas.ts` for zod schemas used by `validate()`). `types/` was not needed: `pino-http` already types `req.id` / `req.log`.

---

## 4. Configuration

All variables are validated at startup by `src/config/env.ts`. If anything is missing or invalid, the server prints **every** problem (variable name + reason, never the value) and exits with code 1.

| Variable | Required | Default | Notes |
|---|---|---|---|
| `DATABASE_URL` | **yes** | — | `postgresql://…` connection string |
| `NODE_ENV` | no | `development` | `development` \| `test` \| `production` |
| `HOST` | no | `0.0.0.0` | Interface to bind |
| `PORT` | no | `3000` | `0`–`65535` (`0` = any free port) |
| `CORS_ALLOWED_ORIGINS` | **in production** | empty | Comma-separated browser origins (e.g. `https://app.krishisutra.in`). `*` rejected. |
| `LOG_LEVEL` | no | `debug` / `silent` (test) / `info` (production) | `fatal` … `trace`, `silent` |
| `REQUEST_BODY_LIMIT` | no | `100kb` | JSON body size limit |
| `TRUST_PROXY` | no | `false` | `true`, `false` or number of proxy hops (Cloud Run: `1`) |
| `DATABASE_CONNECT_TIMEOUT_MS` | no | `5000` | Max wait for a database connection |

`.env` is ignored by `apps/api/.gitignore` and by a new repository-level `.gitignore` (`.env`, `.env.*`, except `.env.example`).

---

## 5. Database connectivity

- **Reuses** the existing single Prisma Client (`src/db/prisma.ts`, Prisma 7 + `@prisma/adapter-pg`). Only change: a connection timeout (`connectionTimeoutMillis`, default 5 s) — without it `pg` waits forever when the database is down. Prisma's own `error` log is turned off in production because its messages can contain query values; the API logs errors safely instead.
- **Startup:** `server.ts` runs `SELECT 1` (3 s limit) **before** listening. If it fails, it logs `Cannot reach the database — the server will not start` (fatal) and exits 1. It never reports that it started.
- **Runtime:** `GET /api/v1/health/database` runs the same check; failure → `503 DATABASE_UNAVAILABLE`. Details (host, error text) go to the log only, scrubbed of connection strings.
- **Shutdown:** on `SIGTERM`/`SIGINT` the server stops accepting connections, finishes in-flight requests (10 s limit), calls `prisma.$disconnect()`, logs `Shutdown complete` and exits 0. `/api/v1/health` returns 503 while draining. Unhandled rejections / uncaught exceptions trigger the same shutdown with exit code 1.
- No destructive commands were run: no reset, no migration changes, no table changes.

> Run the server with `node` directly in production (`npm start` runs `node dist/src/server.js`). Wrappers such as `npx` may not forward `SIGTERM`, which would skip the graceful shutdown.

---

## 6. Security and reliability defaults

| Concern | Implementation |
|---|---|
| Consistent responses | `{ success: true, data }` / `{ success: false, error: { code, message, details?, requestId } }` |
| Error handling | One central handler. Known errors → precise status + code; everything else → `500 INTERNAL_ERROR` with a generic message |
| Stack traces | Only in `development` responses; never in `test` or `production` |
| Validation | `validate({ params, query, body })` with zod → `400 VALIDATION_ERROR` + per-field details; parsed values strip unknown fields |
| Body limits | JSON only, 100 kb default → `413 PAYLOAD_TOO_LARGE`; malformed JSON → `400 INVALID_JSON` |
| CORS | Explicit allow-list; others → `403 CORS_ORIGIN_NOT_ALLOWED`; native apps (no `Origin`) allowed; no cookies |
| Headers | `helmet` (nosniff, HSTS, CSP, frame/referrer policies…); `X-Powered-By` removed |
| Logging | JSON (pino); one line per request: id, method, path (no query string), status, duration. No headers or bodies logged; secrets redacted; Prisma errors logged by type/code only |
| Tracing | `X-Request-Id` on every response (client value reused if safe) and in every error body |
| Database errors | Unique conflict → 409, not found → 404, FK conflict → 409 — database text never returned |

**Dependencies added and why**

| Package | Why |
|---|---|
| `express` 5 | HTTP framework (ADR 0013). v5 forwards async errors to the error handler natively. |
| `cors` | Standard, small CORS implementation for the allow-list. |
| `helmet` | One small package that sets ~a dozen protective HTTP headers; avoids hand-maintaining them. |
| `pino`, `pino-http` | Fast structured JSON logs with redaction and request ids (needed for Cloud Logging). |
| `zod` | Environment and request validation (planned in ADR 0001/0003); shared with future modules. |
| `supertest` (dev) | HTTP tests against the app without opening a port. |
| `@types/express`, `@types/cors`, `@types/supertest` (dev) | Type definitions. |

Deliberately **not** added yet: rate limiting (comes with authentication in 3.2, where it matters — OTP endpoints), compression (better done at the load balancer/CDN), an API-docs generator (with the first business endpoints).

---

## 7. Commands (from `apps/api/`)

```bash
cp .env.example .env          # set DATABASE_URL (+ CORS_ALLOWED_ORIGINS for the web app)
docker compose up -d          # optional local PostgreSQL 16
npm install                   # installs deps + generates Prisma Client
npm run db:deploy             # apply migrations (existing)
npm run db:seed               # demo data (existing)

npm run dev                   # development server with reload (tsx watch) → http://localhost:3000/api/v1
npm run build                 # compile to dist/
npm start                     # production: node dist/src/server.js
npm test                      # all tests (database + backend foundation)
npm run typecheck
```

---

## 8. Endpoints

### `GET /api/v1` — API information

```bash
curl http://localhost:3000/api/v1
```
```json
{
  "success": true,
  "data": {
    "name": "KrishiSutra API",
    "apiVersion": "v1",
    "version": "0.1.0",
    "endpoints": [
      { "method": "GET", "path": "/api/v1", "description": "API information" },
      { "method": "GET", "path": "/api/v1/health", "description": "Application health" },
      { "method": "GET", "path": "/api/v1/health/database", "description": "Database connectivity" }
    ]
  }
}
```

### `GET /api/v1/health` — application health (liveness)

```json
{
  "success": true,
  "data": {
    "status": "ok",
    "environment": "development",
    "apiVersion": "v1",
    "version": "0.1.0",
    "timestamp": "2026-11-15T16:45:02.442Z",
    "uptimeSeconds": 0
  }
}
```
While shutting down: HTTP 503 with `"status": "shutting_down"`.

### `GET /api/v1/health/database` — database connectivity (readiness)

Success (200):
```json
{ "success": true, "data": { "status": "ok", "database": "postgresql", "latencyMs": 1, "timestamp": "2026-11-15T16:45:02.449Z" } }
```
Failure (503):
```json
{ "success": false, "error": { "code": "DATABASE_UNAVAILABLE", "message": "The database is not reachable.", "requestId": "0b1e…" } }
```

### Errors (any route)

```bash
curl http://localhost:3000/api/v1/does-not-exist
```
```json
{ "success": false, "error": { "code": "NOT_FOUND", "message": "Route GET /api/v1/does-not-exist was not found.", "requestId": "23242c86-5464-459f-ade3-6331421432f3" } }
```

| Code | HTTP | When |
|---|---|---|
| `NOT_FOUND` | 404 | Unknown route (or record, from 3.2) |
| `VALIDATION_ERROR` | 400 | Request fails its zod schema (`details`: `[{ path, message, code }]`) |
| `INVALID_JSON` | 400 | Malformed JSON body |
| `PAYLOAD_TOO_LARGE` | 413 | Body over `REQUEST_BODY_LIMIT` |
| `UNSUPPORTED_MEDIA_TYPE` | 415 | Unsupported body encoding |
| `CORS_ORIGIN_NOT_ALLOWED` | 403 | Browser origin not in the allow-list |
| `CONFLICT` | 409 | Unique / related-record conflict in the database |
| `DATABASE_UNAVAILABLE` | 503 | Database unreachable or timed out |
| `INTERNAL_ERROR` | 500 | Anything unexpected (generic message; details only in logs) |

---

## 9. Tests

`npm test` runs everything with Node's built-in test runner. Results on 2026-11-15 (PostgreSQL 16): **66 tests, 66 passed, 0 failed** (17 suites).

| File | Tests | Covers |
|---|---|---|
| `tests/api/env.test.ts` | 8 | Defaults; explicit values; per-environment log levels; missing/empty/invalid `DATABASE_URL` (value never echoed); invalid `PORT`/`NODE_ENV`/`LOG_LEVEL`/body limit/`TRUST_PROXY`; production CORS rules (`*` rejected); all problems reported together |
| `tests/api/app.test.ts` | 18 | API root; health (+ 503 while shutting down); database health against the **real** database, a **genuinely unreachable** database (no host/password/error text leaked) and a hanging one (fast 503); 404s; invalid JSON; payload too large; generic 500 without stack (and with stack only in development); HttpError/known DB error mapping; zod validation errors and parsed values; request id reuse/replacement; CORS allow/deny/native/preflight; security headers |
| `tests/api/server.test.ts` | 4 | Real server process: exits 1 on missing/invalid config; exits 1 when the database is unreachable (fatal log, password never logged, never "listening"); starts, serves both health endpoints from the real database, and on `SIGTERM` logs `Shutting down` → `Shutdown complete` and exits 0 |
| `tests/database.test.ts` | 36 | Existing Part 2 database tests — all still passing |

GitHub Actions (`API (backend + database)` workflow) runs: install → validate schema → typecheck → migrate a fresh PostgreSQL → drift check → seed twice → **build** → all tests.
