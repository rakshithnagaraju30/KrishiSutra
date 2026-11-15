# KrishiSutra — Architecture & Technology Stack (Phase 2)

| Item | Value |
|---|---|
| Document | 02 — Architecture & Technology Stack |
| Phase | Phase 2: Architecture & technology decisions (no application code) |
| Status | Accepted, with assumptions to confirm (§6) |
| Last updated | 2026-11-15 |
| Builds on | [01 — Product Vision & Requirements](../requirements/01-product-vision-and-requirements.md) |
| Decision records | [`docs/adr/`](../adr/README.md) |

---

## 1. What drove these decisions

The stack follows from the Phase 1 decisions and requirements:

| Driver | Source | Consequence for the stack |
|---|---|---|
| One app for Android, iOS **and** web | D3 | Cross-platform client framework with a real web target |
| Low-end Android phones, poor networks | §6 NFRs | Small downloads, native rendering, offline-first mobile |
| Offline crop guides and offline crop tracking | B-16, F-03–F-05, D4 | Local database on device + sync for farmer data |
| Kannada, Hindi, English | D2 | Correct Indic text shaping, localised content in the database, audio per language |
| Verified, versioned, source-cited knowledge | §9, C-01–C-06 | Relational database, version snapshots, an admin tool with a review workflow |
| Explainable recommendations, no invented agronomy | §7, §9 | Deterministic rule engine, not an AI model |
| Location-aware (village → agro-climatic zone) | A-03, A-04 | Geospatial database support |
| Personal data of Indian farmers | §6, DPDP Act 2023 | Hosting in an Indian cloud region, role-based access |
| Probably a small team at the start | — | One programming language, one deployable backend, managed services |

---

## 2. Decisions at a glance

| Area | Decision | ADR |
|---|---|---|
| Language & repo | **TypeScript everywhere**, one **monorepo** (pnpm workspaces + Turborepo) | [0001](../adr/0001-typescript-monorepo.md) |
| Farmer app (Android, iOS, web) | **React Native with Expo** (Expo Router; web via react-native-web) | [0002](../adr/0002-cross-platform-client-expo.md) |
| Backend | **Node.js + Express.js** modular monolith, REST + OpenAPI (originally NestJS) | [0003](../adr/0003-backend-nestjs-modular-monolith.md), [0013](../adr/0013-express-and-prisma.md) |
| Database | **PostgreSQL + PostGIS**, **Prisma ORM** on the server (originally Drizzle) | [0004](../adr/0004-postgresql-postgis.md), [0013](../adr/0013-express-and-prisma.md) |
| Offline | Downloadable versioned **crop packs** for knowledge; **SQLite + outbox sync** for farmer data | [0005](../adr/0005-offline-strategy.md) |
| Content admin | Separate **React admin app (Refine)** over our own API, with an editorial workflow | [0006](../adr/0006-content-admin-editorial-workflow.md) |
| Recommendations | **Deterministic, data-driven rule engine** in a shared TypeScript package | [0007](../adr/0007-rule-based-recommendation-engine.md) |
| Hosting | **Google Cloud, Mumbai region** (Cloud Run, Cloud SQL, Cloud Storage + CDN) | [0008](../adr/0008-hosting-google-cloud-india.md) |
| Sign-in | **Phone number + OTP via Firebase Authentication**; browsing needs no login | [0009](../adr/0009-phone-otp-authentication.md) |
| Media | Object storage + CDN; images in WebP; video in HLS plus a small MP4 for offline; YouTube embeds for partner videos | [0010](../adr/0010-media-pipeline.md) |
| Languages & audio | i18next for UI text; translations stored in the database; **pre-recorded/pre-generated, reviewed audio** per stage | [0011](../adr/0011-localisation-and-audio.md) |
| External data | Adapter per provider (weather, climate, markets) with server-side caching | [0012](../adr/0012-external-data-integrations.md) |

---

## 3. System overview

```
                       ┌──────────────────────────── CLIENTS ─────────────────────────────┐
                       │                                                                  │
   Farmers ──────────► │  Farmer app (Expo / React Native)                                 │
                       │   • Android, iOS  → offline-first: SQLite + crop packs + outbox   │
                       │   • Web           → online-first, static pages for crop guides    │
                       │                                                                  │
   Content team ─────► │  Admin app (React + Refine)  — authors, reviewers, admins         │
                       └───────────────┬───────────────────────────────┬──────────────────┘
                                       │ HTTPS (REST/JSON, OpenAPI)    │ media downloads
                                       ▼                               ▼
              ┌──────────────── Google Cloud · Mumbai (asia-south1) ─────────────────────┐
              │                                                                          │
              │  Cloud Run: NestJS API (modular monolith)          Cloud CDN              │
              │   ├─ knowledge   (categories, crops, varieties,       ▲                   │
              │   │               procedures, stages, resources)      │                   │
              │   ├─ content     (editorial workflow, versions,   Cloud Storage           │
              │   │               crop-pack publishing)            (images, audio,       │
              │   ├─ recommendation (uses rule-engine package)      video, crop packs)    │
              │   ├─ farms       (farms, plots, soil tests)                               │
              │   ├─ cultivation (plans, activities, harvest, sync)                       │
              │   ├─ weather / markets (provider adapters + cache)                        │
              │   ├─ notifications (push via FCM / Expo push)                             │
              │   └─ identity   (verifies Firebase ID tokens, roles)                      │
              │            │                                                             │
              │            ▼                                                             │
              │  Cloud SQL: PostgreSQL + PostGIS  ◄── pg-boss job queue (in Postgres)     │
              │                                                                          │
              │  Cloud Run jobs: media transcoding, crop-pack builds, weather refresh     │
              └──────────────────────────────────────────────────────────────────────────┘
                        │                         │                          │
                        ▼                         ▼                          ▼
              Firebase Authentication    Weather / climate APIs      Market price data
              (phone OTP)                (Open-Meteo, NASA POWER,     (AGMARKNET /
                                          IMD where accessible)       data.gov.in)
```

### Request flows

- **Browse a crop guide (online):** app → `GET /crops/...` → API reads published knowledge → response cached at the CDN (public, same for everyone, so it caches well).
- **Download a crop for offline use:** app → fetch the crop pack manifest → download the JSON pack + chosen-language audio + images (+ small video if the user chooses) → stored on the device.
- **Get a recommendation:** app sends plot inputs → API fetches cached weather/climate for the location → rule engine scores the 6 launch crops → API saves a *recommendation run* (inputs, weather snapshot, knowledge version, results) → app shows reasons, gaps and confidence.
- **Track a crop offline:** app writes activities to SQLite and an outbox → when online, the outbox syncs to `POST /sync` → server stores records and returns changes.
- **Reminders:** scheduled **on the device** as local notifications from the plan dates, so they work without a network; weather alerts come from the server as push notifications.

---

## 4. Proposed repository layout

```
KrishiSutra/
├── apps/
│   ├── mobile/                 # Expo app → Android, iOS, web
│   ├── admin/                  # Content admin (React + Refine)
│   └── api/                    # NestJS backend
├── packages/
│   ├── domain/                 # Shared types and zod validation schemas
│   ├── recommendation-engine/  # Pure TypeScript rule engine (no I/O)
│   ├── i18n/                   # UI strings: kn, hi, en
│   ├── api-client/             # Typed client generated from OpenAPI
│   └── config/                 # Shared lint, tsconfig, test config
├── infra/                      # Infrastructure as code (OpenTofu/Terraform)
├── docs/                       # Requirements, architecture, ADRs
└── .github/workflows/          # CI/CD
```

---

## 5. Supporting tools

| Concern | Choice | Notes |
|---|---|---|
| Runtime | Node.js (current LTS) | Exact versions are pinned when the repo is scaffolded |
| Validation | zod, shared through `packages/domain` | Same rules on client and server |
| Data fetching (app) | TanStack Query | Caching, retries, offline-aware |
| Local DB (app) | expo-sqlite + Drizzle | Same ORM as the server |
| Forms | react-hook-form + zod | |
| Styling (app) | NativeWind | Works on native and web; must respect system font scaling |
| Background jobs | pg-boss (queue stored in Postgres) | No separate Redis needed at MVP scale |
| Search | PostgreSQL full-text + `pg_trgm` | Enough for 6 crops and local-name search; revisit when the catalogue grows |
| Push notifications | Expo push service (FCM on Android, APNs on iOS) | Local notifications for reminders |
| Maps (later) | MapLibre | Plot boundaries are not in the MVP; MVP uses a location pin + village selection |
| Error tracking | Sentry (app, admin, API) | Personal data is scrubbed before sending |
| Logs & metrics | Google Cloud Logging / Monitoring | |
| Tests | Vitest (packages, API), jest-expo (app), Playwright (admin, web), Maestro (mobile end-to-end) | The rule engine needs thorough unit tests |
| CI/CD | GitHub Actions; EAS Build for app binaries; EAS Update for over-the-air JavaScript fixes | |
| Infrastructure as code | OpenTofu (Terraform-compatible) | |

---

## 6. Assumptions to confirm

These questions were still open in Phase 1. I've chosen defaults so work can continue. Each one can change without reworking the overall architecture.

| # | Assumption | Affects | If it turns out differently |
|---|---|---|---|
| AS1 | There's no strong cloud preference; a pay-as-you-go budget is acceptable | ADR 0008 | Everything runs in containers on standard Postgres, so AWS Mumbai (ECS/App Runner + RDS) is a like-for-like swap |
| AS2 | Phone + OTP sign-in is acceptable | ADR 0009 | The identity module sits behind an interface; it can switch to an Indian SMS provider (needs TRAI DLT registration) or WhatsApp OTP |
| AS3 | Partner videos (ICAR/KVK/SAU channels) can be embedded from YouTube; our own videos are hosted by us | ADR 0010 | If we're allowed to host partner videos, they go through the same pipeline as our own and become available offline |
| AS4 | Audio is generated with text-to-speech and checked by a native speaker, with human recordings where TTS quality is poor | ADR 0011 | Human-only recording costs more but needs no architecture change |
| AS5 | Open-Meteo is used under a paid commercial plan, or another provider is chosen | ADR 0012 | Weather sits behind an adapter, so changing provider is configuration |

---

## 7. Explicitly *not* chosen (for now)

| Not chosen | Why |
|---|---|
| Microservices / Kubernetes | Too much to run for a small team; the modular monolith can be split later along its module boundaries |
| GraphQL | REST lets the CDN cache public knowledge and suits partner integrations |
| A machine-learning recommendation model | It conflicts with the "no invented agronomy" rule and needs validated outcome data we don't have yet |
| A headless CMS owning the data model (e.g., Strapi, Payload) | Knowledge versioning, provenance and region scoping are core to the product and belong in our own schema |
| A general-purpose sync engine (e.g., PowerSync, Couchbase) | Farmer data at MVP is small and mostly append-only; a simple outbox is enough. Revisit if conflicts become common |
| Flutter | It's a strong option, but see ADR 0002: React Native gives better web output and one language across app, admin and API |
| PWA-only | Weaker offline storage, background behaviour and voice support on low-end Android; also conflicts with D3 |

---

## 8. Next phase

**Phase 3 — Domain & database design**, based on §8 of the requirements and these decisions:
- Knowledge tables (categories, crops, varieties, requirements, procedures, stages, resources, sources, pests/diseases, reference economics), with region and season scoping.
- Version and publication snapshots, so plans stay pinned to the version they started on.
- How kn/hi/en translations are stored.
- Farmer tables (users, farms, plots, soil tests, recommendation runs, crop plans, cultivation records) and the sync design.
- Location reference data (LGD codes, Karnataka agro-climatic zones).
- Roles and access rules.
