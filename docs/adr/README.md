# Architecture Decision Records

Each ADR records one significant decision: its context, the options considered, the decision, and its consequences. ADRs are not edited after acceptance; to change one, write a new ADR that supersedes it.

**Format:** `NNNN-short-title.md` · **Statuses:** Proposed · Accepted · Superseded by NNNN · Deprecated

| ADR | Title | Status |
|---|---|---|
| [0001](0001-typescript-monorepo.md) | TypeScript everywhere in a single monorepo | Accepted |
| [0002](0002-cross-platform-client-expo.md) | Farmer app: React Native with Expo (Android, iOS, web) | Accepted |
| [0003](0003-backend-nestjs-modular-monolith.md) | Backend: NestJS modular monolith with REST + OpenAPI | Accepted |
| [0004](0004-postgresql-postgis.md) | Database: PostgreSQL + PostGIS with Drizzle ORM | Accepted |
| [0005](0005-offline-strategy.md) | Offline: crop packs for knowledge, SQLite + outbox for farmer data | Accepted |
| [0006](0006-content-admin-editorial-workflow.md) | Content admin app and editorial workflow | Accepted |
| [0007](0007-rule-based-recommendation-engine.md) | Deterministic, data-driven recommendation engine | Accepted |
| [0008](0008-hosting-google-cloud-india.md) | Hosting: Google Cloud, Mumbai region | Accepted (assumption AS1) |
| [0009](0009-phone-otp-authentication.md) | Sign-in: phone OTP via Firebase Authentication | Accepted (assumption AS2) |
| [0010](0010-media-pipeline.md) | Media storage, formats and delivery | Accepted (assumption AS3) |
| [0011](0011-localisation-and-audio.md) | Localisation (kn/hi/en) and audio narration | Accepted (assumption AS4) |
| [0012](0012-external-data-integrations.md) | External data integrations via adapters with caching | Accepted (assumption AS5) |
