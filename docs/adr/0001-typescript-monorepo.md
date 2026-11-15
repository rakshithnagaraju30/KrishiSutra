# ADR 0001 — TypeScript everywhere in a single monorepo

- **Status:** Accepted
- **Date:** 2026-11-15

## Context

KrishiSutra has three deployable parts: a farmer app (Android, iOS, web), a content admin app, and a backend API. They share a lot: domain types (crop, stage, plot…), validation rules, UI strings in three languages, and the recommendation rules. The team is likely small at the start.

## Options considered

| Option | Pros | Cons |
|---|---|---|
| **A. TypeScript for everything, one monorepo** | One language to hire for and learn; types and validation shared end to end; the rule engine can run on server and device | The JavaScript ecosystem changes quickly; dependency upgrades need care |
| B. Dart (Flutter) for the app + another language for backend/admin | Flutter's strengths on mobile | Two or three languages; types duplicated across them; the admin can't share app code |
| C. Kotlin Multiplatform + Kotlin backend | Strong typing, native performance | Web target less mature; smaller talent pool in this space; admin still needs a separate web stack |
| D. Separate repos per app | Independent release cycles | Shared code must be published as packages; changes drift apart |

## Decision

Use **TypeScript** for the farmer app, admin app, API and shared packages, in **one monorepo** managed with **pnpm workspaces** and **Turborepo** (task caching and running only what changed).

## Consequences

- `packages/domain` holds shared types and zod schemas: one definition of what a valid soil test or crop plan is.
- `packages/recommendation-engine` is pure TypeScript, so it can later also run on the device.
- Strict TypeScript settings and shared lint rules live in `packages/config`.
- CI must use Turborepo's affected-only builds so the pipeline stays fast as the repo grows.
- Releases are still independent: app binaries (EAS), API (container) and admin (static site) deploy separately.
