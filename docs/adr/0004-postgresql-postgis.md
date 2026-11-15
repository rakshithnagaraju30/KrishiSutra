# ADR 0004 — Database: PostgreSQL + PostGIS with Drizzle ORM

- **Status:** Accepted
- **Date:** 2026-11-15

## Context

The data is strongly relational (category ↔ crop many-to-many, crop → variety → procedure → stage → resources, provenance on everything). It also needs:
- versioned, immutable published snapshots (plans pinned to a version),
- localised text in three languages,
- flexible structured content inside stages (instructions, materials, warnings),
- geospatial lookups (point → village → agro-climatic zone),
- transactional integrity for farmer records and sync.

## Options considered

| Option | Fit |
|---|---|
| **PostgreSQL + PostGIS** | ✅ Relational integrity, JSONB for flexible content, PostGIS for location, full-text search, mature managed hosting |
| MySQL | ⚠️ Weaker geospatial and JSON support |
| MongoDB / Firestore | ❌ Many-to-many relations, provenance and transactional versioning are harder; weaker relational integrity |

ORM: **Drizzle** (typed SQL, supports PostGIS geometry types and SQLite, so the same ORM works on the device) over Prisma (PostGIS columns are poorly supported).

## Decision

- **PostgreSQL** (current stable major version) with **PostGIS** and **pg_trgm** extensions.
- **Drizzle ORM** and Drizzle migrations, checked into the repo.
- **pg-boss** for background jobs (stored in the same database).
- Identifiers: **UUIDv7** (time-sortable; clients can generate them offline for sync).

## Consequences

- One database to back up and operate at MVP. Knowledge and farmer data live in **separate schemas** (`knowledge`, `farmer`), which supports the separation rule and access control.
- Schema design is Phase 3; this ADR only fixes the engine.
- Managed hosting: Cloud SQL for PostgreSQL (ADR 0008) supports PostGIS.
- Point-in-time recovery must be enabled. Farmer data must not be lost.
