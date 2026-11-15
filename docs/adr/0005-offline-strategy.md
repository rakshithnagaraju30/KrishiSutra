# ADR 0005 — Offline: crop packs for knowledge, SQLite + outbox for farmer data

- **Status:** Accepted
- **Date:** 2026-11-15

## Context

Farmers often have weak or no connectivity in the field. Requirements B-16 (offline guides) and D4 (crop tracking in the MVP) mean the mobile app must:
1. show downloaded crop guides (text, images, audio, optionally video) offline, and
2. let farmers record activities, inputs and harvests offline and sync later.

The two kinds of data behave very differently:

| | Knowledge | Farmer data |
|---|---|---|
| Who writes | Content team only | The farmer (and the server for derived fields) |
| On the device | Read-only | Read/write |
| Size | Larger (media) | Small |
| Conflicts | None | Rare (usually one person, one phone) |

## Options considered

| Option | Verdict |
|---|---|
| General sync engine (PowerSync, WatermelonDB sync, Couchbase Lite) | Powerful but adds a dependency and infrastructure that our small, mostly append-only farmer data doesn't need yet |
| Realm / Atlas Device Sync | ❌ Device Sync has been deprecated by its vendor |
| HTTP cache only | ❌ Not reliable for large media; no offline writes |
| **Crop packs + SQLite outbox** | ✅ Simple, testable, fits both data types |

## Decision

**Knowledge → versioned crop packs.**
- When content is published, a job builds a **crop pack** per crop and language: a JSON bundle (crop, varieties, procedures, stages, sources) + a manifest listing media files with sizes and checksums.
- The app downloads the pack, then the media it needs (audio for the chosen language and images by default; video only if the user opts in, preferably on Wi-Fi).
- Packs carry the **knowledge version**. The app checks for updates when online and shows "Updated guidance available". It never silently changes a plan's pinned version.

**Farmer data → local SQLite + outbox.**
- The app keeps farms, plots, plans and records in **expo-sqlite** (Drizzle).
- Every local change is written to an **outbox** table in the same transaction.
- `POST /v1/sync` sends outbox entries (client-generated UUIDv7 ids, so retries are safe) and receives server changes since the last sync token.
- Conflict rule: activity and harvest entries are **append-only** (no conflict). Editable records (plot details, plan dates) use **last-write-wins per field** with server time, and the overwritten value is logged.
- Reminders are **local notifications** scheduled from plan dates, so they work offline.

**Web:** online-first using TanStack Query caching; no offline tracking at MVP.

## Consequences

- The app needs a downloads screen (storage used, delete pack, Wi-Fi-only setting).
- The server must keep old published versions available while any active plan references them.
- If multi-device or shared-farm editing becomes common, revisit with a sync engine (new ADR).
