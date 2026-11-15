# ADR 0010 — Media storage, formats and delivery

- **Status:** Accepted, based on assumption AS3 (partner videos embedded)
- **Date:** 2026-11-15

## Context

Each stage can have photos, videos, animations and audio (requirements B-10, E-01 to E-07). Networks are slow and data is costly, so offline downloads must be small. Every media item needs a licence and attribution (E-02). The MVP has 6 crops, so media volume is modest.

## Decision

**Storage & delivery:** original uploads go to a private Cloud Storage bucket. Processed renditions go to a public bucket behind **Cloud CDN** (ADR 0008). Media records in the database hold source, licence, attribution, language, review status and checksums.

| Type | Delivered formats | Offline format |
|---|---|---|
| Photos | WebP in several widths (e.g., 320/640/1280 px); JPEG fallback where needed | 640 px WebP |
| Video (our own, or partner video we may host) | HLS adaptive streaming (360p/480p/720p) | One small MP4 (≈360p), downloaded only if the user opts in |
| Video (partner, embed-only) | YouTube embed with attribution | Not available offline; the stage's text, photos and audio still are |
| Animations | Short MP4 (looped) or Lottie JSON for simple diagrams | Same file |
| Audio narration | AAC (or Opus) mono, low bitrate suitable for speech | Same file |

**Processing:** a **Cloud Run job** using **ffmpeg** (video and audio) and an image library (e.g., sharp) runs when a file is uploaded through the admin. We avoid a paid video platform at MVP volume; Cloud Transcoder or a hosted video service can replace it if volume grows.

**Low-data mode:** the app prefers audio + images over video and never auto-plays video on mobile data.

## Consequences

- Each media item shows its attribution in the app.
- A takedown process (unpublish a media item everywhere) is part of the admin.
- Embedded partner videos depend on YouTube availability and can't be downloaded. Obtaining permission to host key videos is a content task.
