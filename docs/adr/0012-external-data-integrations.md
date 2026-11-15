# ADR 0012 — External data integrations via adapters with caching

- **Status:** Accepted, based on assumption AS5 (weather provider terms confirmed before launch)
- **Date:** 2026-11-15

## Context

Recommendations and alerts need weather forecasts, climate normals, and (later) market prices (requirements §10). Providers differ in coverage, licence terms, cost and reliability. Some Indian government sources publish data portals or files rather than stable APIs. Knowledge browsing must keep working when any provider is down (§6).

## Decision

**Adapter per provider** behind a common interface in the API's `weather` and `markets` modules:

| Data | Primary (MVP) | Fallback / supplement | Notes |
|---|---|---|---|
| Forecast & current weather | Open-Meteo | Another commercial provider via the same interface | Open-Meteo's free tier is non-commercial; use its commercial plan or another provider for production |
| Historical climate normals (temperature, rainfall) | NASA POWER | — | Free; pre-computed per location grid and stored |
| Official forecasts & agromet advisories | IMD (where access is available) | — | Access terms to be confirmed |
| Market prices (later) | AGMARKNET / data.gov.in | e-NAM | Shown as information with date and source; no price predictions |
| Location reference | LGD codes (state → district → block → village) | Reverse geocoding provider | Loaded into PostGIS |
| Agro-climatic zones | Karnataka zone definitions from UAS/state sources | — | Stored as zone ↔ district/taluk mapping (and polygons where available) |

**Caching**
- Weather is cached **per grid cell** (rounded coordinates, so nearby farms share one request) with a short time-to-live for forecasts; climate normals are cached long-term.
- Background jobs (pg-boss) refresh forecasts for cells that have active plans, so alerts don't depend on the app being open.
- Every value carries `source` and `fetched_at`. The app shows "last updated" and works with stale data when a provider is down.

**Recommendation runs** store the exact weather/climate snapshot they used (ADR 0007).

## Consequences

- Before launch: confirm licence and terms for each provider, and record attribution requirements.
- Provider keys live in Secret Manager; usage is monitored against quotas.
- Adding a provider means writing an adapter, with no change to the rest of the system.
