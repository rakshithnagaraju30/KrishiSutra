# ADR 0008 — Hosting: Google Cloud, Mumbai region

- **Status:** Accepted, based on assumption AS1 (no cloud preference stated yet)
- **Date:** 2026-11-15

## Context

Users are in Karnataka; data includes farmer locations and land details (personal data under India's DPDP Act 2023). Traffic at launch is small and may be bursty around sowing seasons. The team is small, so managed services are preferred. Sign-in uses Firebase Authentication (ADR 0009), and push notifications use FCM.

## Options considered

| Option | Notes |
|---|---|
| **Google Cloud (asia-south1 Mumbai; asia-south2 Delhi available)** | Cloud Run (containers, scales to zero), Cloud SQL Postgres with PostGIS, Cloud Storage + Cloud CDN; same account as Firebase Auth and FCM |
| AWS (ap-south-1 Mumbai, ap-south-2 Hyderabad) | Equivalent services (App Runner/ECS, RDS, S3 + CloudFront); a like-for-like alternative |
| Azure (Central/South India) | Equivalent; less alignment with Firebase |
| A single VPS (DigitalOcean, Hetzner etc.) | Cheapest, but we would run backups, scaling and security ourselves |

## Decision

Host on **Google Cloud in asia-south1 (Mumbai)**:
- **Cloud Run** for the API container and for jobs (media transcoding, crop-pack builds, weather refresh).
- **Cloud SQL for PostgreSQL** with PostGIS, automated backups and point-in-time recovery.
- **Cloud Storage** for media and crop packs, served through **Cloud CDN**.
- **Secret Manager** for API keys; **Cloud Logging/Monitoring** for operations.
- Static hosting for the admin app and the web build of the farmer app (Cloud Storage + CDN, or Firebase Hosting).
- Environments: `dev`, `staging`, `production`, as separate projects. Infrastructure is defined in OpenTofu (`infra/`).

## Consequences

- Personal data stays in an Indian region.
- Cloud Run scales to zero, so costs stay low while usage is small.
- Portability: the API is a standard container on standard PostgreSQL, so moving to AWS needs no code changes beyond storage and auth adapters.
- **To confirm with the product owner:** budget ceiling and whether a cloud is already preferred (AS1). Set up billing alerts from day one.
