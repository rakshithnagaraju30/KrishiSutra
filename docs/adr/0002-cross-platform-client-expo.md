# ADR 0002 — Farmer app: React Native with Expo (Android, iOS, web)

- **Status:** Accepted
- **Date:** 2026-11-15

## Context

Decision D3 requires one app for Android, iOS and web. Most users will be on low-end Android phones with poor networks. The app must render **Kannada and Devanagari** text correctly, play audio and video, store data offline, schedule reminders, and use large, simple controls. The web version also serves learners, and public crop guides benefit from being findable by search engines.

## Options considered

| Criterion | **React Native + Expo** | Flutter | Kotlin/Compose Multiplatform | PWA only |
|---|---|---|---|---|
| Android + iOS | ✅ Native UI components | ✅ Own rendering engine | ✅ (iOS stable) | ⚠️ Limited on iOS |
| Web quality | ✅ Real HTML via react-native-web; static rendering possible for crop guide pages (SEO) | ⚠️ Canvas/WebAssembly rendering: large first download, weak SEO and accessibility | ⚠️ Web target still maturing | ✅ |
| Indic text | ✅ Uses the operating system's text engine and fonts | ✅ Bundled shaping engine (works; fonts must be bundled) | ✅ | ✅ |
| Low-end Android | ✅ Good with the new architecture and Hermes | ✅ Very good | ✅ Very good | ⚠️ Depends on browser |
| Offline storage | ✅ expo-sqlite, file system | ✅ sqflite/drift | ✅ | ⚠️ Browser storage limits and eviction |
| Code shared with admin and API | ✅ TypeScript (ADR 0001) | ❌ Dart only | ❌ | ✅ |
| Build and update tooling | ✅ EAS Build; over-the-air JavaScript updates | ✅ Shorebird (third-party) | ⚠️ | ✅ |

## Decision

Build the farmer app with **React Native using Expo**, with **Expo Router** for navigation, targeting **Android, iOS and web** from one codebase.

- Native builds: **EAS Build**. Fast fixes: **EAS Update** (JavaScript-only changes, within store policies).
- Web: Expo web output (react-native-web), with static rendering for public crop and stage pages.
- Fonts: **Noto Sans Kannada** and **Noto Sans Devanagari** (open licence) bundled for consistent rendering.

## Consequences

- Platform-specific code is limited to storage, notifications and media download.
- Performance budgets are set and tested on a real low-end Android device as part of CI/QA (cold start, guide screen render, app size).
- The web version is online-first. Offline features (crop packs, tracking) are mobile features at MVP.
- Expo SDK upgrades are needed regularly (roughly twice a year).
- Flutter remains a reasonable alternative. This decision mainly weighs web quality and the single-language benefit.
