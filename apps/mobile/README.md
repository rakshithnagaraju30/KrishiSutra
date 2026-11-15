# KrishiSutra — farmer app (prototype)

A clickable prototype of the farmer app (Expo / React Native) for Android, iOS and web.

> **Prototype.** Crop details are labelled sample placeholders, not farming advice.
> The structure (categories, the 6 launch crops, stage titles) is real; agronomic facts
> (durations, varieties, doses, costs, yields) will come from verified, source-cited content.

## What it shows

- First-launch language choice: Kannada, Hindi, English (Kannada and Hindi are draft translations)
- **Grow:** categories (crops can be in several categories), search, the 6 launch crops
- **Crop:** Overview · Steps · Calendar · Cost · Tips, with a step timeline
- **Stage:** step X of Y, guide / video / images, read-aloud with the phone's voice, previous/next
- **Suggest:** the six "what should I grow?" questions (location, soil, water, soil test, season, budget) and a results screen showing missing information; crop ranking is not calculated in the prototype
- **My Crops:** start tracking a crop, set the sowing date, tick off steps (saved on the phone)

## Run locally

```bash
cd apps/mobile
npm ci
npx expo start          # scan the QR code with a development build, or press w for web
npx tsc --noEmit        # typecheck
```

## Android APK

Pushing changes under `apps/mobile/` runs `.github/workflows/android-apk.yml`, which builds a release APK
and publishes it as a GitHub **pre-release** (see the repository's *Releases* page).

## Prototype shortcuts (to be replaced, per the ADRs)

| Prototype | Planned (ADR) |
|---|---|
| Standalone npm app | pnpm + Turborepo monorepo (0001) |
| Simple built-in string table | i18next (0011) |
| Phone text-to-speech for "Listen" | Pre-recorded, reviewed audio (0011) |
| Data stored with AsyncStorage | SQLite + outbox sync (0005) |
| Release APK signed with the debug key | Proper upload keystore in CI secrets |
