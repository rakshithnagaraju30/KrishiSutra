# 07 — Live data: business APIs, crop content and the connected app

Status: built and tested (2026-11-16). This is the work the product owner asked for after Part 3.1
("add real time data … grab through the Android app"), with these decisions:

| Question | Decision |
|---|---|
| Hosting | Render (free web service) + Neon (free PostgreSQL) — guide: [06](../deployment/06-deploy-render-neon.md) |
| Sign-in | No login yet: an anonymous **device account** per phone (phone OTP per ADR 0009 later) |
| Content | Drafted by the AI from public sources, labelled **Source-cited · pending expert review** (D5) |
| Scope | Growing guides, live weather, my farm and crop tracking, crop suggestions |
| Fetching sources | GitHub Actions workflow `fetch-sources.yml` (the cloud sandbox cannot reach the sites) |

## 1. API (apps/api, base `/api/v1`)

All responses: `{ success: true, data }` or `{ success: false, error: { code, message, details?, requestId } }`.
Language: `?lang=kn|hi|en` (or `Accept-Language`); missing translations fall back to English.
Rate limits: `RATE_LIMIT_PER_MINUTE` per IP for everything; `DEVICE_REGISTRATIONS_PER_HOUR` for sign-up.

| Area | Endpoints | Auth |
|---|---|---|
| Device account | `POST /auth/device` → `{ token, user }`; `GET/PATCH /me` | token for `/me` |
| Catalog | `GET /reference`, `/categories`, `/crops?category&q`, `/crops/:slug`, `/procedures/:id` | none |
| Weather | `GET /weather?lat&lon` (Open-Meteo, cached per 0.1° cell: fresh 30 min, stale fallback 24 h) | none |
| Farms | `GET/POST /farms`, `GET/PATCH/DELETE /farms/:id`, `POST /farms/:id/plots`, `POST /farms/:id/water-sources`, `PATCH/DELETE /plots/:id`, `GET/POST /plots/:id/soil-tests` | token |
| Crop tracking | `GET/POST /farm-crops`, `GET/PATCH/DELETE /farm-crops/:id`, `POST /farm-crops/:id/{tasks,activities,expenses,harvests}`, `PATCH /tasks/:id`, `DELETE /expenses/:id`, `POST /harvests/:id/sales` | token |
| Suggestions | `POST/GET /recommendations`, `GET /recommendations/:id` | token |

- **Device token:** `ks_dev_` + 32 random bytes; only its SHA-256 hash is stored (`DeviceCredential`).
  Every farmer query is ownership-scoped (`src/db/ownership.ts`); another farmer's record answers 404.
- **Catalog** serves only PUBLISHED crops and guides, each fact with a trust label
  (`VERIFIED` / `SOURCE_CITED` / `UNVERIFIED`) and its source (title, organisation, URL).
- **Starting a crop** pins the current published guide version and copies its stages into tasks in one
  transaction. Due dates are filled only for stages whose days count from sowing/planting.
- **Suggestions** use rule set `ks-rules-1.0` (`src/recommendation/engine.ts`, ADR 0007): season, soil type,
  soil-test ranges, water need vs water access, region and budget are checked one at a time against
  source-cited data; each crop gets a level and a sourced reason per criterion. Missing farmer input or
  missing knowledge → `UNKNOWN`, never a guess. No yields, profits or scores are produced.

## 2. Crop content (apps/api/prisma/seed/content)

One file per launch crop (`rice.ts`, `maize.ts`, `tomato.ts`, `chilli.ts`, `groundnut.ts`, `onion.ts`),
format in `types.ts`, loaded by `load.ts` from the seed (idempotent).

- **Source:** Tamil Nadu Agricultural University — TNAU Agritech Portal and the TNAU Rice Expert System
  (rice main-field steps use its Karnataka sections). Every instruction, requirement, soil row and
  season row names its source URL.
- **Not included on purpose:** chemical pesticide, herbicide, fungicide and fumigant names and doses.
  Those steps show a caution to confirm with the local KVK (`CHEMICAL_CAUTION`). A test fails if any
  such product name appears in the content files. Yields and costs are not entered.
- **Gaps are shown, not filled:** e.g. the Karnataka rice fertilizer dose, the groundnut NPK table and
  tomato harvest guidance were not in the fetched pages; the guide says so.
- **Seasons** for tomato, onion and groundnut are mapped by KrishiSutra from the months the source
  states (noted on each row). Rice seasons are the source's Karnataka list.
- **Versioning:** bump `guide.version` when content changes; the loader publishes the new version and
  supersedes the old one, while crops already being tracked keep the version they started with.
- **Translations:** Kannada/Hindi guide names and stage titles are DRAFT; instruction text is English for now.

How sources were collected: run the **Fetch sources** workflow (`.github/workflows/fetch-sources.yml`)
with a list of URLs; it prints page text from the job log (TLS certificates always verified).

Expert review is the next content step: an agricultural expert should check each guide, add the
Karnataka-specific doses (UAS Bengaluru / UAS Dharwad package of practices) and mark it VERIFIED.

## 3. Android app (apps/mobile, version 0.2.0)

- `src/api/client.ts` — server address (default `expo.extra.apiBaseUrl` in app.json, changeable in
  Settings), device registration, 70 s timeout (free server wakes slowly), `ApiError`.
- `src/api/useApi.ts` — shows the copy saved on the phone first, then refreshes; offline it keeps the copy.
- Screens: Grow (live categories/crops/search), crop page (guide steps with day ranges, overview with
  seasons/soils/needs, sources), step page (instructions by type, cautions, materials, mistakes,
  source links, Listen), Home weather card (farm or phone location), My farm, Start tracking,
  crop record (tick tasks, expenses, harvest), "What should I grow?" (results with reasons and sources).
- The APK is built by `.github/workflows/android-apk.yml` on every push touching `apps/mobile`.

## 4. Verification

- API: 94 tests (`npm test`) incl. content rules and the seeded guides served through the API; CI
  workflow `api-database.yml` runs them on a fresh database after migrate + seed ×2.
- App: `npx tsc --noEmit`; a web export was clicked through against a local API with Playwright
  (grow → crop → step, farm setup, start tracking, tick task, suggestions, settings). The weather call
  could not reach Open-Meteo from the development sandbox, so the card was checked with a stubbed reply.
