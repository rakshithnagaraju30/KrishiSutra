# ADR 0014 — Sign-in: own phone OTP + JWT sessions, pluggable SMS provider

- **Status:** Accepted
- **Date:** 2026-11-16
- **Supersedes:** [ADR 0009](0009-phone-otp-authentication.md) (Firebase Authentication). Its other points stand:
  browsing works without sign-in; roles and permissions live in our database.

## Context

The Part 3.2 brief from the product owner specifies **phone OTP + JWT** implemented in the KrishiSutra
backend: OTPs generated and hashed by us, short-lived access tokens, refresh-token rotation and
revocation, and a configurable SMS provider interface so a provider can be added later.
The current app (v0.2.0) uses anonymous device accounts that already hold farmer data.

## Decision

- The API generates OTPs (CSPRNG), stores only an HMAC-SHA256 (`PhoneOtp`), and enforces expiry,
  attempt limits, single use, resend cooldown, an hourly cap per number and a per-IP rate limit.
- Signed-in sessions: **access token** = JWT HS256, 15 minutes, claims `sub` + session family, no roles;
  **refresh token** = random 256-bit opaque string, only its SHA-256 stored (`AuthSession`), rotated on
  every use; re-use of a rotated token revokes the whole family; logout revokes the family.
- Roles are read from `UserRole` on every request (never from the token or the request).
- SMS goes through an `SmsSender` interface. Implemented now: `console` (development only) and `none`.
  **The production provider is not chosen yet** (product owner: decide later). Until then phone sign-in
  answers 503 in production and device accounts keep working.
- Device accounts that register a phone number are **upgraded in place** (same user id, data kept);
  device tokens remain valid until the app gets a login screen.
- Roles reuse the four existing rows: FARMER, ADMIN, CONTENT_EDITOR (content manager), AGRI_EXPERT
  (reviewer / expert). The first ADMIN is granted with `npm run user:grant-role`.

## Consequences

- Two new tables (`PhoneOtp`, `AuthSession`) — migration `…_auth_otp_sessions`.
- Before production phone sign-in: choose an SMS provider (e.g. MSG91 with TRAI DLT sender ID and
  templates, or Twilio), implement its `SmsSender`, and set `SMS_PROVIDER`.
- Rate limits are in memory (one instance). Several instances need a shared store (e.g. Redis).
- Access tokens are checked against the session table on each request, so logout is immediate.
