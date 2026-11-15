# ADR 0009 — Sign-in: phone OTP via Firebase Authentication

- **Status:** Accepted, based on assumption AS2 (phone OTP acceptable)
- **Date:** 2026-11-15

## Context

Most target users have a mobile number but often no email, and passwords are a barrier. Browsing knowledge must work **without** sign-in (U-01). An account is needed only to save farms, plans and records. Sending OTP SMS from our own sender ID in India requires **TRAI DLT registration** (registered sender ID and message templates).

## Options considered

| Option | Pros | Cons |
|---|---|---|
| **Firebase Authentication (phone)** | Native SDKs; Google sends the SMS (no DLT setup for us); built-in abuse protection; fits GCP hosting | Cost per verification beyond the free allowance; vendor dependency |
| Indian SMS provider (e.g., MSG91) + our own OTP logic | Lower per-SMS cost at scale; WhatsApp OTP options | We must do DLT registration and build OTP security (rate limits, expiry, fraud) ourselves |
| Supabase Auth | Open source | Still needs an SMS provider (and DLT) |
| Email/password | Free | Unsuitable for target users |

## Decision

- Use **Firebase Authentication with phone OTP** in the app and admin.
- The API verifies Firebase **ID tokens** and maps them to our own `users` table in PostgreSQL. **Roles and permissions live in our database**, not in Firebase.
- Guest mode: full knowledge browsing and offline downloads without an account. Saving a farm prompts sign-in, and any guest data is attached to the new account.
- The identity module sits behind an interface, so we can switch to an Indian SMS or WhatsApp OTP provider later.

## Consequences

- Watch the cost per verification; revisit if it grows (switch to a DLT-registered provider).
- Shared family phones: one signed-in account per device at MVP; multiple profiles per device is a later enhancement (requirements §13.14).
- Account deletion and data export endpoints are required (DPDP Act).
