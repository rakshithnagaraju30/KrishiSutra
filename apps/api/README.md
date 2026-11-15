# KrishiSutra — API & database

Backend package. **Part 2 (current):** PostgreSQL database designed with Prisma ORM 7 — schema,
migrations, seed data and integration tests. API routes (Express.js) arrive in Part 3.

- Design: [docs/database/03-database-architecture.md](../../docs/database/03-database-architecture.md)
- ER diagrams: [docs/database/04-er-diagrams.md](../../docs/database/04-er-diagrams.md)

## Layout

```
apps/api/
├── prisma.config.ts            # Prisma 7 config (schema folder, migrations, seed, DATABASE_URL)
├── prisma/
│   ├── schema/                 # one .prisma file per module (00_enums … 14_community)
│   ├── migrations/             # init (generated) + check_constraints (hand-written)
│   └── seed/                   # idempotent seed: reference data + demonstration catalogue
├── src/db/
│   ├── prisma.ts               # the single Prisma Client
│   └── ownership.ts            # ownership filters for farmer-owned records
├── tests/                      # integration tests (each test rolls back)
├── scripts/generate-er-diagrams.ts
├── docker-compose.yml          # local PostgreSQL 16 (PostGIS image)
└── .env.example
```

## Run

Requires Node.js 22+ and PostgreSQL 16.

```bash
cp .env.example .env            # edit DATABASE_URL if needed
docker compose up -d            # optional local database
npm install                     # also generates Prisma Client into ./generated
npm run db:deploy               # apply migrations
npm run db:seed                 # reference + demonstration data
npm test                        # integration tests
```

| Script | What it does |
|---|---|
| `db:migrate` | Create/apply a migration after editing `prisma/schema/*.prisma`, then regenerate the client |
| `db:deploy` | Apply pending migrations (CI / production) |
| `db:seed` | Seed (safe to run repeatedly) |
| `db:status` | Migration status |
| `db:reset` | **Development only** — drop, re-migrate, re-seed |
| `db:er` | Regenerate the ER diagrams from the database |
| `db:studio` | Browse data in Prisma Studio |
| `prisma:validate` / `prisma:format` / `prisma:generate` | Schema tooling |
| `typecheck` / `test` | TypeScript check / integration tests |

Seed data is **demonstration content only** (DRAFT, UNVERIFIED, no agronomic values).
