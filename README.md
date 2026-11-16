# KrishiSutra

A practical farming assistant that helps farmers and growers decide **what to grow** on their land and **how to grow it**, step by step — grounded in verified agricultural knowledge from credible sources (ICAR, State Agricultural Universities, Krishi Vigyan Kendras, government agriculture departments).

**Launch scope:** Karnataka · Kannada, Hindi, English · Paddy, Maize, Tomato, Chilli, Groundnut, Onion · Android, iOS and web.

## Status

| Phase | Status |
|---|---|
| 1. Product vision & requirements | ✅ Done |
| 1b. Clickable prototype (Android APK) | ✅ `apps/mobile` |
| 2. Architecture & technology stack | ✅ Decided (assumptions to confirm) |
| Part 2. Database architecture & Prisma models | ✅ Done |
| Part 3.1 Backend foundation (Express + TypeScript) | ✅ Done |
| Live data: business APIs, source-cited guides for 6 crops, connected Android app (v0.2.0) | ✅ Done — server must be deployed (Render + Neon) |
| Part 3.2 Authentication & user management (phone OTP + JWT, roles, profiles) | ✅ Done — awaiting approval for Part 3.3 |
| Expert review of content, production SMS provider, app login screens, content admin | ⏭ Next |

## Documents

- [01 — Product Vision & Requirements](docs/requirements/01-product-vision-and-requirements.md)
- [02 — Architecture & Technology Stack](docs/architecture/02-technology-stack.md)
- [03 — Database Architecture](docs/database/03-database-architecture.md)
- [04 — ER Diagrams](docs/database/04-er-diagrams.md)
- [05 — Backend Foundation](docs/backend/05-backend-foundation.md)
- [06 — Deploy: Render + Neon](docs/deployment/06-deploy-render-neon.md)
- [07 — Live data: APIs, crop content, connected app](docs/backend/07-live-data-apis-and-content.md)
- [08 — Authentication & user management](docs/backend/08-authentication.md)
- [Architecture Decision Records](docs/adr/README.md)
- [UI reference — Grow Crops screens](docs/assets/ui-reference-grow-crops.png)

## Technology at a glance

TypeScript · React Native + Expo (Android, iOS, web) · Node.js + Express API · PostgreSQL + Prisma ORM 7 · Refine admin app · Google Cloud (Mumbai) · phone OTP + JWT · rule-based recommendation engine.

## Repository layout

| Path | Contents |
|---|---|
| `apps/mobile` | Farmer app prototype (Expo) — see its README |
| `apps/api` | Backend: Express + TypeScript API (health endpoints so far) and the database (Prisma schema, migrations, seed, tests) |
| `docs/` | Requirements, architecture, database design, ADRs |
| `.github/workflows` | Android APK build · API (backend + database) checks |
