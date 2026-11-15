-- AlterTable
ALTER TABLE "User" ADD COLUMN     "isDeviceAccount" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "DeviceCredential" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "tokenHash" CHAR(64) NOT NULL,
    "platform" VARCHAR(20),
    "deviceLabel" VARCHAR(100),
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastUsedAt" TIMESTAMPTZ(6),
    "revokedAt" TIMESTAMPTZ(6),

    CONSTRAINT "DeviceCredential_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "DeviceCredential_tokenHash_key" ON "DeviceCredential"("tokenHash");

-- CreateIndex
CREATE INDEX "DeviceCredential_userId_idx" ON "DeviceCredential"("userId");

-- AddForeignKey
ALTER TABLE "DeviceCredential" ADD CONSTRAINT "DeviceCredential_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Hand-written: device ("no login") accounts may have neither email nor phone.
ALTER TABLE "User" DROP CONSTRAINT "User_email_or_phone_chk";
ALTER TABLE "User" ADD CONSTRAINT "User_email_or_phone_chk"
  CHECK ("email" IS NOT NULL OR "phone" IS NOT NULL OR "isDeviceAccount");
ALTER TABLE "DeviceCredential" ADD CONSTRAINT "DeviceCredential_token_hash_hex_chk"
  CHECK ("tokenHash" ~ '^[0-9a-f]{64}$');
