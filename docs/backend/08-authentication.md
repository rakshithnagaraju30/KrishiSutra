# 08 — Authentication and user management (Part 3.2)

Phone OTP registration and login, JWT access tokens with rotating refresh tokens, profile APIs and
role-based access. Decision record: [ADR 0014](../adr/0014-own-phone-otp-and-jwt.md).
Code: `apps/api/src/services/phone-auth.service.ts`, `user.service.ts`, `middleware/auth.ts`,
`auth/` (phone, otp, tokens), `integrations/sms/`, `routes/users.routes.ts`. Tests: `tests/api/auth.test.ts`.

## 1. Database

| Model | Use |
|---|---|
| `User` (existing) | `phone` (E.164, unique), `phoneVerifiedAt`, `status` (`PENDING_VERIFICATION` → `ACTIVE`; `SUSPENDED`, `DEACTIVATED`), `email`, `preferredLanguageId`, `lastLoginAt`, `isDeviceAccount`. `passwordHash` stays unused (OTP-only). |
| `Role`, `UserRole` (existing) | FARMER, ADMIN, CONTENT_EDITOR (content manager), AGRI_EXPERT (reviewer / expert). `assignedById` records who granted a role. |
| `DeviceCredential` (existing) | Anonymous app accounts (app v0.2.0); still accepted. |
| **`PhoneOtp`** (new) | One row per code: phone, purpose (`REGISTRATION`/`LOGIN`), `codeHash` (HMAC-SHA256), `expiresAt`, `attempts`/`maxAttempts`, `consumedAt`, `invalidatedAt`. `userId` null = decoy (unknown number, nothing sent). |
| **`AuthSession`** (new) | One row per refresh token: `tokenHash` (SHA-256), `familyId`, `expiresAt`, `revokedAt` + `revokedReason` (`ROTATED`, `LOGOUT`, `REUSE_DETECTED`, `ACCOUNT_DISABLED`, `ADMIN`), `replacedById`. |

Both new tables have CHECK constraints (E.164 phone, 64-hex hashes, attempts ≤ max, expiry after
creation, revocation reason set together with revocation time).

## 2. Flows

```
Register      POST /auth/register {fullName, phone, language?, email?}
              → user PENDING_VERIFICATION (role FARMER), REGISTRATION code sent by SMS
Verify        POST /auth/verify-otp {phone, otp}
              → phone verified, status ACTIVE, signed in: {user, tokens}
Log in        POST /auth/send-otp {phone, purpose:"LOGIN"} → code by SMS (only to registered numbers)
              POST /auth/login {phone, otp} → {user, tokens}
Use the API   Authorization: Bearer <accessToken>        (15 minutes)
Refresh       POST /auth/refresh {refreshToken} → new access + refresh token (old one stops working)
Log out       POST /auth/logout {refreshToken} → that sign-in (all its tokens) is revoked
```

- **Phone numbers** are normalised to `+91XXXXXXXXXX` from `98765 43210`, `098765…`, `+91 …`, `91…`,
  `0091 …`. Only Indian mobile numbers (10 digits starting 6–9) are accepted.
- **Resend:** `POST /auth/send-otp {phone, purpose:"REGISTRATION"}`.
- **Unfinished registration:** registering again with the same unverified number updates it and sends a
  new code. A verified number answers `409 PHONE_ALREADY_REGISTERED`.
- **Device accounts:** if the app sends its device token (`Authorization: Bearer ks_dev_…`) with
  `/auth/register`, that account is upgraded after verification (same user id; farms and crops kept;
  `isDeviceAccount` becomes false). The device token keeps working.

## 3. Endpoints and examples

All responses use `{ "success": true, "data": … }` or
`{ "success": false, "error": { "code", "message", "details"?, "requestId" } }`.

### POST /api/v1/auth/register
```json
{ "fullName": "Lakshmi", "phone": "98765 43210", "language": "kn", "email": "lakshmi@example.com" }
```
`201`
```json
{ "success": true, "data": { "status": "PENDING_VERIFICATION", "upgradedDeviceAccount": false,
  "otp": { "phone": "+91 ••••••3210", "expiresInSeconds": 300, "resendAfterSeconds": 60 } } }
```
Errors: `400 VALIDATION_ERROR` (bad phone/email, unknown fields such as `role`), `409 PHONE_ALREADY_REGISTERED`,
`409 EMAIL_ALREADY_REGISTERED`, `429 OTP_COOLDOWN` (`details.retryAfterSeconds`), `429 OTP_LIMIT_REACHED`,
`429 RATE_LIMITED`, `502 OTP_SEND_FAILED`, `503 OTP_UNAVAILABLE` (no SMS provider configured).

### POST /api/v1/auth/send-otp
```json
{ "phone": "9876543210", "purpose": "LOGIN" }
```
`200` — identical for registered and unknown numbers:
```json
{ "success": true, "data": { "message": "If this number can receive a code, it has been sent.",
  "otp": { "phone": "+91 ••••••3210", "expiresInSeconds": 300, "resendAfterSeconds": 60 } } }
```

### POST /api/v1/auth/verify-otp  ·  POST /api/v1/auth/login
```json
{ "phone": "9876543210", "otp": "482913", "platform": "android" }
```
`200`
```json
{ "success": true, "data": {
  "user": { "id": "0193…", "fullName": "Lakshmi", "phone": "+919876543210", "status": "ACTIVE", "roles": ["FARMER"] },
  "tokens": { "tokenType": "Bearer", "accessToken": "eyJ…", "expiresIn": 900,
              "refreshToken": "ks_rt_…", "refreshTokenExpiresAt": "2026-12-16T10:00:00.000Z" } } }
```
Errors: `400 OTP_INVALID` (`details.attemptsLeft`), `400 OTP_EXPIRED`, `400 OTP_ATTEMPTS_EXCEEDED`,
`403 ACCOUNT_NOT_ACTIVE` (suspended/deactivated — only after a correct code), `409 PHONE_ALREADY_REGISTERED`.

### POST /api/v1/auth/refresh
`{ "refreshToken": "ks_rt_…" }` → `200` with a new `tokens` object (same shape as above, without `user`).
Errors: `401 INVALID_REFRESH_TOKEN` (unknown, expired, revoked), `401 REFRESH_TOKEN_REUSED` (an old,
already-rotated token was presented — the whole sign-in is revoked), `403 ACCOUNT_NOT_ACTIVE`.

### POST /api/v1/auth/logout
`{ "refreshToken": "ks_rt_…" }` → `200 { "loggedOut": true }` (always; idempotent).

### GET /api/v1/users/me · PATCH /api/v1/users/me  (signed in)
```json
{ "id": "0193…", "fullName": "Lakshmi", "phone": "+919876543210", "phoneVerified": true,
  "email": "lakshmi@example.com", "emailVerified": false, "language": "kn", "status": "ACTIVE",
  "roles": ["FARMER"], "isDeviceAccount": false, "createdAt": "…", "lastLoginAt": "…" }
```
PATCH accepts only `fullName`, `email` (or `null` to remove), `language` (`kn`/`hi`/`en`). Any other field
(`role`, `roles`, `status`, `phone`, `phoneVerifiedAt`, …) → `400 VALIDATION_ERROR` and nothing changes.
A changed email is marked unverified. Changing the phone number is not supported yet (needs its own OTP flow).
The older `GET/PATCH /api/v1/me` (device accounts) still works.

### Administrators (role ADMIN)
| Endpoint | Purpose |
|---|---|
| `GET /api/v1/admin/users?phone=9876543210` | Find a user by mobile number |
| `GET /api/v1/admin/users/{id}` | User profile and roles |
| `POST /api/v1/admin/users/{id}/roles` `{ "role": "CONTENT_EDITOR" }` | Grant a role |
| `DELETE /api/v1/admin/users/{id}/roles/{ROLE}` | Remove a role |

Rules: privileged roles (ADMIN, CONTENT_EDITOR, AGRI_EXPERT) only for ACTIVE users with a verified phone
(`409 USER_NOT_VERIFIED`); an administrator cannot remove their own ADMIN role (`409 CANNOT_REMOVE_OWN_ADMIN`).
**First administrator:** register in the app, then on a machine with `DATABASE_URL` set:
`cd apps/api && npm run user:grant-role -- 9876543210 ADMIN`.

## 4. Roles and permissions

| Role | Who | Can do now |
|---|---|---|
| FARMER | Every registered user (automatic) | Own farms, crops, suggestions, profile |
| CONTENT_EDITOR | Agricultural content manager | Reserved for the content admin module |
| AGRI_EXPERT | Agricultural reviewer / expert | Reserved for content review and diagnosis |
| ADMIN | Operators | Manage user roles |

For future modules: `router.post('/x', requireAuth, requireRole('CONTENT_EDITOR', 'ADMIN'), handler)`.
`requireAuth` loads status and roles from the database on every request: a role change or suspension
takes effect immediately, and a client cannot gain permissions by changing request data or tokens.

## 5. Security measures

- OTP: `crypto.randomInt`, 6 digits, 5 minutes, 5 attempts (atomic counter), single use, older codes
  invalidated, 60 s resend cooldown, 5 codes per number per hour, 60 sign-in requests per IP per hour,
  per-number advisory lock against parallel requests, stored as HMAC-SHA256 keyed with `OTP_HASH_SECRET`.
- No user enumeration on `send-otp` (decoy rows: same response, same limits, no SMS). Registration does
  reveal that a verified number exists (needed to say "please log in"); it is rate-limited.
- Access tokens: HS256 with `JWT_ACCESS_SECRET`; algorithm, issuer, audience, expiry and type are
  verified; the session family must still be active (logout is immediate).
- Refresh tokens: 256-bit random, SHA-256 stored, rotated on each use, re-use detection revokes the family.
- No passwords. Codes, tokens and secrets are redacted from logs; codes are never logged except by the
  development-only console sender.
- Strict request schemas reject unknown fields; consistent error codes; 401 for missing/invalid tokens,
  403 for inactive accounts and missing roles.

## 6. Configuration

| Variable | Default | Notes |
|---|---|---|
| `JWT_ACCESS_SECRET` | random per process (dev/test); **none in production** | ≥ 32 chars |
| `OTP_HASH_SECRET` | same | ≥ 32 chars, different from the JWT secret |
| `ACCESS_TOKEN_TTL_SECONDS` | 900 | 60–3600 |
| `REFRESH_TOKEN_TTL_DAYS` | 30 | renewed on rotation |
| `OTP_LENGTH`, `OTP_TTL_SECONDS`, `OTP_MAX_ATTEMPTS` | 6, 300, 5 | |
| `OTP_RESEND_COOLDOWN_SECONDS`, `OTP_MAX_PER_PHONE_PER_HOUR` | 60, 5 | |
| `OTP_REQUESTS_PER_HOUR` | 60 | per client IP (mobile networks share IPs — keep it generous) |
| `SMS_PROVIDER` | `console` (development), `none` (production) | `console` is refused in production |

Production phone sign-in needs **both secrets and an SMS provider**; otherwise it answers
`503 OTP_UNAVAILABLE` and everything else (including device accounts) works. `render.yaml` asks Render to
generate both secrets; on an existing Render service add them under **Environment** (any long random value).

## 7. SMS providers

- **Development:** `SMS_PROVIDER=console` (default when `NODE_ENV=development`). The code is printed in the
  server log as `DEVELOPMENT SMS (not sent)`. It refuses to run in any other environment.
- **Tests:** a mock sender is injected (`createApp({ smsSender })`); no SMS is sent.
- **Production (to do):** choose a provider, e.g. **MSG91** (India; needs TRAI DLT entity, sender ID and an
  approved OTP template) or **Twilio**. Implement `SmsSender.sendOtp()` in `src/integrations/sms/`, add its
  name to `SMS_PROVIDERS`, read its credentials from environment variables (never commit them), and
  return it from `createSmsSender`. Message texts are in `otpText()` (Kannada/Hindi are drafts and must
  match the DLT template).

## 8. Tests

`tests/api/auth.test.ts` (21 tests, real database, mock SMS): registration, duplicate and invalid numbers,
verification, wrong/expired/re-used codes, cooldown/hourly/IP limits, login, unknown numbers, suspended
accounts, token tampering/expiry/audience/type/`alg:none`, refresh rotation and re-use detection, logout,
unauthenticated access, roles (incl. immediate revocation), profile updates, protected fields, device
account upgrade, 503/502 provider cases and production configuration rules.
