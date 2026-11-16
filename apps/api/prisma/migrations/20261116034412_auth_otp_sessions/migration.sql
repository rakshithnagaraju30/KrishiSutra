-- CreateEnum
CREATE TYPE "OtpPurpose" AS ENUM ('REGISTRATION', 'LOGIN');

-- CreateEnum
CREATE TYPE "SessionRevocationReason" AS ENUM ('ROTATED', 'LOGOUT', 'REUSE_DETECTED', 'ACCOUNT_DISABLED', 'ADMIN');

-- CreateTable
CREATE TABLE "PhoneOtp" (
    "id" UUID NOT NULL,
    "phone" VARCHAR(20) NOT NULL,
    "purpose" "OtpPurpose" NOT NULL,
    "userId" UUID,
    "codeHash" CHAR(64) NOT NULL,
    "sentAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMPTZ(6) NOT NULL,
    "attempts" SMALLINT NOT NULL DEFAULT 0,
    "maxAttempts" SMALLINT NOT NULL,
    "consumedAt" TIMESTAMPTZ(6),
    "invalidatedAt" TIMESTAMPTZ(6),

    CONSTRAINT "PhoneOtp_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuthSession" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "familyId" UUID NOT NULL,
    "tokenHash" CHAR(64) NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMPTZ(6) NOT NULL,
    "lastUsedAt" TIMESTAMPTZ(6),
    "revokedAt" TIMESTAMPTZ(6),
    "revokedReason" "SessionRevocationReason",
    "replacedById" UUID,
    "platform" VARCHAR(20),

    CONSTRAINT "AuthSession_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PhoneOtp_phone_purpose_sentAt_idx" ON "PhoneOtp"("phone", "purpose", "sentAt");

-- CreateIndex
CREATE INDEX "PhoneOtp_userId_idx" ON "PhoneOtp"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "AuthSession_tokenHash_key" ON "AuthSession"("tokenHash");

-- CreateIndex
CREATE UNIQUE INDEX "AuthSession_replacedById_key" ON "AuthSession"("replacedById");

-- CreateIndex
CREATE INDEX "AuthSession_userId_idx" ON "AuthSession"("userId");

-- CreateIndex
CREATE INDEX "AuthSession_familyId_idx" ON "AuthSession"("familyId");

-- AddForeignKey
ALTER TABLE "PhoneOtp" ADD CONSTRAINT "PhoneOtp_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuthSession" ADD CONSTRAINT "AuthSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuthSession" ADD CONSTRAINT "AuthSession_replacedById_fkey" FOREIGN KEY ("replacedById") REFERENCES "AuthSession"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Hand-written CHECK constraints (Part 3.2).
ALTER TABLE "PhoneOtp"
  ADD CONSTRAINT "PhoneOtp_phone_e164_chk" CHECK ("phone" ~ '^\+[1-9][0-9]{6,14}$'),
  ADD CONSTRAINT "PhoneOtp_code_hash_hex_chk" CHECK ("codeHash" ~ '^[0-9a-f]{64}$'),
  ADD CONSTRAINT "PhoneOtp_attempts_range_chk" CHECK ("attempts" >= 0 AND "maxAttempts" >= 1 AND "attempts" <= "maxAttempts"),
  ADD CONSTRAINT "PhoneOtp_expiry_after_sent_chk" CHECK ("expiresAt" > "sentAt"),
  ADD CONSTRAINT "PhoneOtp_consumed_needs_user_chk" CHECK ("consumedAt" IS NULL OR "userId" IS NOT NULL);

ALTER TABLE "AuthSession"
  ADD CONSTRAINT "AuthSession_token_hash_hex_chk" CHECK ("tokenHash" ~ '^[0-9a-f]{64}$'),
  ADD CONSTRAINT "AuthSession_expiry_after_created_chk" CHECK ("expiresAt" > "createdAt"),
  ADD CONSTRAINT "AuthSession_revocation_pair_chk" CHECK (("revokedAt" IS NULL) = ("revokedReason" IS NULL)),
  ADD CONSTRAINT "AuthSession_replaced_means_rotated_chk" CHECK ("replacedById" IS NULL OR "revokedReason" = 'ROTATED'),
  ADD CONSTRAINT "AuthSession_not_self_replaced_chk" CHECK ("replacedById" IS NULL OR "replacedById" <> "id");
