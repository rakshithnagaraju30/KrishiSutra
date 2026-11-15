# ADR 0011 — Localisation (kn/hi/en) and audio narration

- **Status:** Accepted, based on assumption AS4 (reviewed TTS + human recordings where needed)
- **Date:** 2026-11-15

## Context

Launch languages are Kannada, Hindi and English (D2). There are two kinds of text:
1. **UI text** (buttons, labels, messages, recommendation reason codes) — owned by developers, changes with releases.
2. **Content text** (crop descriptions, stage instructions, warnings) — owned by the content team, changes without app releases.

Many users prefer listening to reading (U-04). Narration must be accurate, because a mispronounced or mistranslated dose instruction is a safety issue.

## Decision

**UI text**
- **i18next** (react-i18next) with ICU message format in `packages/i18n`, shared by the app and admin.
- Numbers, dates and units are formatted with `Intl` per locale. Local land units are converted in `packages/domain`.
- Fonts: Noto Sans Kannada and Noto Sans Devanagari (ADR 0002).

**Content text**
- Stored in the database with a translation per language and its own review status (ADR 0006). The exact table design is in Phase 3.
- Fallback order: user's language → English. A visible notice appears when a translation is missing; content is never machine-translated on the fly.
- Crops have **local names** in each language for search (e.g., names farmers actually use).

**Audio narration**
- Audio is **produced in advance** per stage and language, reviewed, and stored as media (ADR 0010). It is **not** generated live on the device. This allows offline use and consistent, checked quality.
- Production: text-to-speech (e.g., Bhashini or Google Cloud Text-to-Speech, both of which cover Indian languages) followed by review by a native speaker. Where quality is poor, a human records it instead.
- When the source text changes, the audio is marked as outdated until it is regenerated and reviewed.

**Voice search** (S priority) — later, using a speech-to-text service for Indian languages (e.g., Bhashini). Not in the MVP critical path.

## Consequences

- Content translation and audio review are real workload: 6 crops × all stages × 3 languages. Plan content capacity accordingly.
- Translation status is shown in the admin per item and language.
