# KrishiSutra — context for AI agents

Read this first. It summarises everything built and decided so far (as of 2026-11-15), the rules to
follow, and what comes next. Details live in `docs/`; this file tells you where.

---

## 1. What KrishiSutra is

A practical farming assistant for India (launch: **Karnataka**). It answers two questions:

1. **"What should I grow on my land?"** — *Feature A, smart crop recommendation* from soil type, water
   source/availability, location + weather, soil-test values and an optional budget.
2. **"How do I grow it, step by step?"** — *Feature B, crop growing procedure*: categories → crop →
   variety → a crop-specific stage timeline → detailed stage screens (instructions, photos, real farm
   videos, animations, audio, materials, mistakes, warnings, sources).

Plus crop tracking for farmers (tasks, reminders, activities, expenses, harvests, sales).

Users: smallholder farmers (often low literacy, low-end Android phones, weak networks), home
gardeners, beginners, learners. UI must be simple, image-first, large touch targets, voice/audio,
regional languages, offline where possible.

## 2. Non-negotiable rules

- **Never invent agronomic content.** No made-up crop durations, varieties, doses, sowing dates,
  yields, costs, profits or recommendations. Content must come from cited, credible sources (ICAR,
  State Agricultural Universities such as UAS Bengaluru/Dharwad, KVKs, government departments).
  Placeholders must be clearly labelled as placeholders.
- **No AI-generated recommendations, yields or profit figures.** The recommendation engine is a
  deterministic rule engine over verified requirement data (ADR 0007). AI may help only with
  non-agronomic tasks (translation drafts, OCR, search), always with human review.
- **Separate verified information from estimates** in data and UI (labels: Verified / Estimate /
  Source-cited (pending expert review) / Not available).
- **Keep shared agricultural knowledge separate from farmer-owned data.** Farmer records reference
  knowledge (and pin a procedure *version*) but never modify it.
- Respect media licensing and attribution. Pesticide guidance only from approved sources.
- Privacy: farmer data is personal (India's DPDP Act 2023); every farmer query must be ownership-scoped.
- Development branch: `claude/agriculture-platform-vision-7xftwo`. Don't push to other branches
  without permission. Don't open PRs unless asked.
- The product owner wants to be **asked when in doubt** and to approve each part before the next.
  **Part 3.1 (backend foundation) is done; Part 3.2 has NOT been approved yet** — do not start it without approval.

## 3. Decisions made (product owner)

| # | Decision |
|---|---|
| D1 | Launch region: **Karnataka** |
| D2 | Launch UI languages: **Kannada, Hindi, English** (database also supports Telugu, Tamil, Malayalam) |
| D3 | Platform: **one cross-platform app (Android + iOS) + web** |
| D4 | MVP scope: Feature A + Feature B + crop tracking |
| D5 | No expert partners yet → content starts from public citable sources, labelled "Source-cited — pending expert review" |
| D6 | Launch crops: **Paddy, Maize, Tomato, Chilli, Groundnut, Onion** |
| Part 2 brief | Backend stack: **Node.js + Express.js, PostgreSQL, Prisma ORM, optional PostGIS, Cloudinary or S3-compatible storage**, UUID keys, Decimal for money/measurements |

Still open (defaults assumed, see `docs/architecture/02-technology-stack.md` §6): own vs partner
videos, phone-OTP sign-in acceptable, business model, hosting provider/budget.

## 4. Technology (current)

| Area | Choice | Record |
|---|---|---|
| Language | TypeScript everywhere | ADR 0001 |
| Farmer app | React Native + **Expo SDK 58** (Expo Router), Android/iOS/web | ADR 0002 |
| Backend | Node.js 22 + **Express.js 5** + TypeScript (in `apps/api`), pino logs, zod validation, helmet, CORS allow-list | ADR 0003 → 0013 |
| Database | **PostgreSQL 16** + **Prisma ORM 7.10.1** (driver adapter `@prisma/adapter-pg`) | ADR 0004 → 0013 |
| Offline | Crop packs for knowledge; SQLite + outbox sync for farmer data (on device) | ADR 0005 |
| Content admin | React + Refine, editorial workflow | ADR 0006 |
| Recommendations | Deterministic, data-driven rule engine | ADR 0007 |
| Hosting (assumed) | Google Cloud, Mumbai | ADR 0008 |
| Sign-in (assumed) | Phone OTP via Firebase Auth; browsing without login | ADR 0009 |
| Media | Object storage + CDN; WebP; HLS + small offline MP4; YouTube embeds for partner video | ADR 0010 |
| Languages/audio | i18n strings + DB translations; pre-produced reviewed audio | ADR 0011 |
| External data | Adapters with caching (Open-Meteo, NASA POWER, IMD, AGMARKNET, LGD) | ADR 0012 |

All ADRs: `docs/adr/README.md`.

## 5. What has been built — timeline

1. **Requirements** — `docs/requirements/01-product-vision-and-requirements.md` (vision, personas,
   journeys, functional/non-functional requirements, conceptual model, data sources, gaps, risks,
   decisions D1–D6). UI reference image: `docs/assets/ui-reference-grow-crops.png`.
2. **Architecture & stack** — `docs/architecture/02-technology-stack.md` + ADRs 0001–0012.
3. **Clickable prototype app** — `apps/mobile/` (Expo). Language choice on first launch (kn/hi/en),
   Home, Grow (10 categories, search, 6 launch crops, multi-category crops), crop screen
   (Overview/Steps/Calendar/Cost/Tips, step timeline), stage detail (step X of Y, guide/video/images,
   phone text-to-speech "Listen", previous/next), "What should I grow?" 6-question wizard with a
   missing-information summary (ranking NOT calculated), My Crops tracking (sowing date, tick steps,
   stored with AsyncStorage). All agronomic facts are labelled placeholders. Kannada/Hindi strings are
   **draft translations**.
   - Android APK is built by GitHub Actions (`.github/workflows/android-apk.yml`) and published as a
     GitHub **pre-release**; it is signed with the debug key (prototype only). The product owner has
     no laptop and installs APKs on their phone from the chat/Releases page.
4. **Part 2 — database** — `apps/api/` (complete, verified, awaiting approval):
   - 75 Prisma models in 14 files `apps/api/prisma/schema/NN_*.prisma` (users, reference data,
     categories, crops/varieties/requirements, versioned procedures, media & sources & reviews,
     translations, farms/plots/water/soil tests, recommendations + weather snapshots, crop lifecycle,
     pests/diseases/diagnosis, inputs/expenses, harvest/sales, notifications/community).
   - Migrations: `*_init` (generated) + `*_check_constraints` (hand-written, 123 CHECKs).
     249 foreign keys incl. 12 composite FKs; 3 partial unique indexes.
   - Seed (idempotent, demonstration only): roles, 6 languages, 26 units (gunta/cent included),
     India → Karnataka, soil types, seasons, 21 agronomic parameters, lookups, 10 + 13 categories,
     9 crops (Rice, Maize, Tomato, Chilli, Onion, Groundnut, Cotton, Mango, Marigold), "Demo variety A/B",
     one DRAFT demo rice procedure.
   - 36 integration tests (`apps/api/tests/`, each test rolls back) — all pass locally and in CI
     (`.github/workflows/api-database.yml`: fresh DB → migrate deploy → drift check → seed ×2 → tests).
   - Design doc: `docs/database/03-database-architecture.md`; ER diagrams generated from the live DB:
     `docs/database/04-er-diagrams.md` (+ `er-overview.png`); ADR 0013.
5. **Part 3.1 — backend foundation** — inside `apps/api/` (complete, awaiting approval for 3.2):
   - Express 5 + TypeScript: `src/app.ts` (app factory, dependencies injected), `src/server.ts`
     (validate env → `SELECT 1` → listen → graceful shutdown on SIGTERM/SIGINT; exits 1 if config is
     invalid or the DB is unreachable), layers `routes/ → controllers/ → services/ → db/`.
   - `src/config/env.ts` (zod; all problems reported, values never echoed), `src/config/logger.ts`
     (pino JSON, redaction, safe error serialisation), middleware: request id + access log, helmet,
     CORS allow-list, JSON body limit, zod `validate()`, 404, central error handler.
   - Endpoints: `GET /api/v1`, `GET /api/v1/health`, `GET /api/v1/health/database` (503 on failure).
   - Response shape: `{success:true,data}` / `{success:false,error:{code,message,details?,requestId}}`.
   - 66 tests pass (30 new + 36 database). Production build: `npm run build` → `node dist/src/server.js`.
   - Doc: `docs/backend/05-backend-foundation.md`.

## 6. Repository map

```
AGENTS.md                      ← this file (CLAUDE.md imports it)
README.md
apps/mobile/                   Expo prototype (has its own AGENTS.md from the Expo template)
apps/api/                      Backend: Express API (src/app.ts, src/server.ts) + Prisma schema, migrations, seed, tests
  prisma.config.ts             Prisma 7 config (schema folder, migrations, seed, DATABASE_URL)
  prisma/schema/*.prisma       one file per module
  prisma/migrations/           init + check_constraints
  prisma/seed/                 reference.ts, catalog.ts, index.ts
  src/db/prisma.ts             THE single Prisma Client — never create another
  src/db/ownership.ts          ownership filters for farmer data (use in every farmer query)
  tests/                       helpers.ts, database.test.ts
  scripts/generate-er-diagrams.ts
docs/requirements/ docs/architecture/ docs/database/ docs/adr/ docs/assets/
.github/workflows/             android-apk.yml, api-database.yml
```

## 7. How to run

```bash
# Database (apps/api) — needs Node 22+ and PostgreSQL 16
cd apps/api && cp .env.example .env && docker compose up -d   # or a local PostgreSQL
npm install            # also runs prisma generate
npm run db:deploy && npm run db:seed && npm test
npm run dev            # API on http://localhost:3000/api/v1 ; production: npm run build && npm start
npm run db:migrate     # after editing prisma/schema/*.prisma (also regenerates the client)
npm run db:er          # regenerate ER diagrams from the database

# Mobile prototype (apps/mobile)
cd apps/mobile && npm ci && npx tsc --noEmit && npx expo start
```

## 8. Gotchas learned the hard way

- **Prisma 7:** config lives in `prisma.config.ts`; the client is generated to `apps/api/generated/prisma`
  (git-ignored) and imported as `../../generated/prisma/client.ts`; `migrate dev` does **not** run
  `generate` (npm scripts do both). Use `process.env.DATABASE_URL` in the config, not `env()`,
  so `npm install` works without a `.env`.
- **Prisma `partialIndexes` (preview) bug:** if a partial unique index's columns are a subset of an
  `upsert` key, Prisma emits an invalid `ON CONFLICT`. Fix used: include the condition column in the
  index (e.g. `@@unique([cropId, isPrimary], where: raw("\"isPrimary\" = true"))`). Keep this pattern.
- **CHECK constraints** can't be written in Prisma schema — add them in hand-written migrations
  (`prisma migrate dev --create-only`), named `<Table>_<rule>_chk`. They cause no drift.
- **Composite FKs** (e.g. `(cropVarietyId, cropId) → CropVariety(id, cropId)`) keep related ids
  consistent; when creating stages nested under a version, don't pass `procedureId` (Prisma fills it).
- **`prisma migrate reset` refuses to run for AI agents** without the user's explicit consent — ask
  the user; for verification, create a separate fresh database and use `migrate deploy` instead.
- **Cloud sandbox network:** `dl.google.com` (Android SDK), `docs.expo.dev` and `prisma.io` are
  blocked; npm registry and GitHub work. Build APKs via GitHub Actions. Run Expo CLI with
  `EXPO_OFFLINE=1` (its version API is blocked) and check APIs against `node_modules` typings.
- **Express:** `req.url` is rewritten inside routers — use `req.originalUrl` for full paths. Run the
  server with `node` directly (not via `npx`/`npm`) so SIGTERM reaches it. Zod object-level refinements
  don't run when a field fails — cross-field env rules are checked separately in `loadConfig`.
- GitHub Actions on this repo: the Android workflow lets Gradle install SDK packages (explicit
  `sdkmanager "platforms;android-37"` failed). The repo is public, so release assets can be
  downloaded with plain `curl`.

## 9. Next steps (only after the product owner approves)

**Part 3.2+ — business APIs:** add one module at a time under `apps/api/src` (`routes/` → `controllers/`
→ `services/` → `repositories/` (create with the first module) + `validators/` zod schemas used by
`middleware/validate.ts`); register sub-routers in `src/routes/index.ts`; throw `HttpError` for expected
failures; auth (phone OTP per ADR 0009) + rate limiting; ownership checks via `src/db/ownership.ts`;
transactions for multi-record writes; procedure publish/version workflow; task generation from pinned versions.
Later: content admin app, recommendation rule engine, real verified content for the 6 launch crops,
connecting the mobile prototype to the API, offline packs, reminders. Deferred database items are
listed in `docs/database/03-database-architecture.md` §12 (PostGIS, LGD import, auth tables, audit log,
media renditions, crop packs, market prices, RLS, search).
