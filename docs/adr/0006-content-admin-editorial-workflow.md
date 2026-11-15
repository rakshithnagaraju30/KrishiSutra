# ADR 0006 — Content admin app and editorial workflow

- **Status:** Accepted
- **Date:** 2026-11-15

## Context

All agronomic content must be source-cited, reviewed and versioned (requirements §9, C-01 to C-06). There are no expert partners yet (D5), so content is published as **"Source-cited — pending expert review"** until reviewed. The content team needs a desktop tool to manage categories, crops, varieties, requirements, procedures, stages, media, sources and translations.

## Options considered

| Option | Pros | Cons |
|---|---|---|
| Headless CMS owns the data (Strapi, Payload, Directus) | Admin UI and localisation for free | Our core model (versioning snapshots, provenance, region scoping, rule data) would be shaped by the CMS's conventions; harder to keep plans pinned to versions; a second system holding the source of truth |
| Django admin | Mature | Second language (see ADR 0001) |
| **React admin app on our own API (Refine)** | Our schema stays the single source of truth; Refine supplies list/edit/forms, auth and access control on top of REST | We build the workflow screens ourselves |

## Decision

Build `apps/admin` as a **React** single-page app using **Refine** (open-source admin framework) with **Ant Design** components, talking to the NestJS API.

**Roles:** `content_author`, `translator`, `reviewer`, `admin` (plus `farmer` for app users).

**Workflow states for knowledge items:**
`Draft → In review → Source-cited (pending expert review) → Expert verified → Published → Archived`

- Every agronomic field set requires at least one **source** (publication, institution, URL, date, licence).
- Translations (kn/hi/en) have their own status and must be reviewed before publishing in that language.
- **Publishing** creates an immutable **version snapshot** and triggers crop-pack builds (ADR 0005).
- Every change is written to an audit log.

## Consequences

- The workflow is enforced in the API, not only in the admin UI.
- More upfront work than an off-the-shelf CMS. That's accepted, because trust and versioning are core to the product.
- When expert partners join, "Expert verified" becomes a review step with the reviewer's identity recorded. No redesign needed.
