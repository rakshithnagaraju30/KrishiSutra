# KrishiSutra

A practical farming assistant that helps farmers and growers decide **what to grow** on their land and **how to grow it**, step by step — grounded in verified agricultural knowledge from credible sources (ICAR, State Agricultural Universities, Krishi Vigyan Kendras, government agriculture departments).

**Launch scope:** Karnataka · Kannada, Hindi, English · Paddy, Maize, Tomato, Chilli, Groundnut, Onion · Android, iOS and web.

## Status

| Phase | Status |
|---|---|
| 1. Product vision & requirements | ✅ Done |
| 1b. Clickable prototype (Android APK) | ✅ `apps/mobile` |
| 2. Architecture & technology stack | ✅ Decided (assumptions to confirm) |
| Part 2. Database architecture & Prisma models | ✅ Done — awaiting approval for Part 3 |
| Part 3. API | ⏭ Next (after approval) |

## Documents

- [01 — Product Vision & Requirements](docs/requirements/01-product-vision-and-requirements.md)
- [02 — Architecture & Technology Stack](docs/architecture/02-technology-stack.md)
- [03 — Database Architecture](docs/database/03-database-architecture.md)
- [04 — ER Diagrams](docs/database/04-er-diagrams.md)
- [Architecture Decision Records](docs/adr/README.md)
- [UI reference — Grow Crops screens](docs/assets/ui-reference-grow-crops.png)

## Technology at a glance

TypeScript · React Native + Expo (Android, iOS, web) · Node.js + Express API · PostgreSQL + Prisma ORM 7 · Refine admin app · Google Cloud (Mumbai) · Firebase phone OTP · rule-based recommendation engine.

## Repository layout

| Path | Contents |
|---|---|
| `apps/mobile` | Farmer app prototype (Expo) — see its README |
| `apps/api` | Database (Prisma schema, migrations, seed, tests); API in Part 3 |
| `docs/` | Requirements, architecture, database design, ADRs |
| `.github/workflows` | Android APK build · API database checks |
