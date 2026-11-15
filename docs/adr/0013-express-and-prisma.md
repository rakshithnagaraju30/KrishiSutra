# ADR 0013 — Backend: Express.js and Prisma ORM

- **Status:** Accepted
- **Date:** 2026-11-15
- **Supersedes:** the framework choice in [ADR 0003](0003-backend-nestjs-modular-monolith.md) (NestJS) and the ORM choice in [ADR 0004](0004-postgresql-postgis.md) (Drizzle). Everything else in those ADRs stands.

## Context

The product owner's Part 2 brief specifies the backend stack: **Node.js + Express.js**, **PostgreSQL**, **Prisma ORM**, optional **PostGIS**, and **Cloudinary or S3-compatible** storage for media.

## Decision

- **Express.js** is the HTTP framework. It is added in Part 3 with the first API routes; Part 2 contains no routes.
- **Prisma ORM 7** (latest stable, 7.10.1 at the time of writing) is the ORM, with the `@prisma/adapter-pg` driver adapter and a multi-file schema (one file per module).
- Still valid from the earlier ADRs: modular-monolith structure (organise Express routers by module), REST + OpenAPI, PostgreSQL + PostGIS, UUIDv7 keys, pg-boss for jobs, and Drizzle + SQLite **on the mobile device** for offline data (ADR 0005). Prisma is server-side only.
- Media files go to S3-compatible storage or Cloudinary; the database stores URLs and metadata only.

## Consequences

- Prisma gives typed queries, migrations and a clear schema language. Its schema cannot express CHECK constraints, so those live in a hand-written migration (see docs/database/03).
- Express has no built-in structure. To keep the modular boundaries from ADR 0003, Part 3 will use one router + service per module, shared validation (zod) and a central error handler.
- Partial unique indexes use Prisma's `partialIndexes` preview feature. A known `upsert` issue is avoided by including the condition column in the index (documented and tested).
