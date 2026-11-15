# ADR 0003 — Backend: NestJS modular monolith with REST + OpenAPI

- **Status:** Accepted — framework choice superseded by [ADR 0013](0013-express-and-prisma.md) (Express.js); the modular structure still applies
- **Date:** 2026-11-15

## Context

The backend serves published crop knowledge (read-heavy, the same for everyone), the editorial workflow, recommendations, farmer data and sync, weather/market integrations, and notifications. The team is small and the MVP has six crops, but the design must separate knowledge from farmer data (requirements §8) and grow later.

## Options considered

| Option | Pros | Cons |
|---|---|---|
| **A. NestJS (TypeScript) modular monolith** | Clear module structure, dependency injection, guards for roles, OpenAPI generation, shares code with the app (ADR 0001) | More boilerplate than minimal frameworks |
| B. Fastify/Express (minimal) | Light and fast | We would build structure, validation and docs conventions ourselves |
| C. Backend-as-a-service (Supabase/Firebase) | Very fast to start; auth and storage included | Business logic (versioning, rule engine, sync) ends up in scattered functions; harder to test; lock-in |
| D. Python (Django/FastAPI) | Django admin; strong data ecosystem | A second language; can't share types or the rule engine with the app |
| E. Microservices | Independent scaling | Too much to operate at this stage |

## Decision

Use **NestJS** as a **modular monolith** deployed as one container. Modules: `identity`, `knowledge`, `content` (editorial workflow, publishing), `recommendation`, `farms`, `cultivation` (plans, records, sync), `weather`, `markets`, `notifications`, `media`.

- **API style:** REST/JSON, versioned under `/v1`. OpenAPI generated from code; `packages/api-client` is generated from it.
- **Validation:** zod schemas from `packages/domain`.
- **Caching:** public knowledge endpoints send cache headers so the CDN can serve them; personal endpoints are never cached.
- **Background work:** pg-boss queues (ADR 0004) for weather refresh, crop-pack builds, media processing and notification fan-out.

## Consequences

- Modules talk to each other only through their public services, never through each other's tables. This keeps a later split into services possible.
- Knowledge modules have **read-only** access to farmer data and vice versa, enforced in code review and tests.
- A single deployable keeps operations simple. Cloud Run scales the instances (ADR 0008).
