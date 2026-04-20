-- Run in Supabase → SQL Editor (manual schema; no prisma db push).
-- Safe to re-run: skips enums/tables/indexes that already exist.
-- Then: npm run prisma:generate

-- Enums (42710 = duplicate_object if already created)
DO $$ BEGIN
  CREATE TYPE "PaymentIntentStatus" AS ENUM ('PENDING', 'SUCCESS', 'FAILED');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "AssetKind" AS ENUM ('NATIVE_SOL', 'SPL_TOKEN', 'EVM_NATIVE', 'EVM_ERC20');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS "Merchant" (
  id TEXT PRIMARY KEY,
  "webhookUrl" TEXT,
  "webhookSecret" TEXT,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE "Merchant" ADD COLUMN IF NOT EXISTS "privyUserId" TEXT;
CREATE UNIQUE INDEX IF NOT EXISTS "Merchant_privyUserId_key" ON "Merchant" ("privyUserId") WHERE "privyUserId" IS NOT NULL;

CREATE TABLE IF NOT EXISTS "MerchantAssetAllowlist" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "merchantId" TEXT NOT NULL REFERENCES "Merchant"(id) ON DELETE CASCADE,
  "chainId" TEXT NOT NULL,
  mint TEXT NOT NULL,
  decimals INTEGER NOT NULL,
  symbol TEXT,
  CONSTRAINT "MerchantAssetAllowlist_merchantId_chainId_mint_key" UNIQUE ("merchantId", "chainId", mint)
);

CREATE INDEX IF NOT EXISTS "MerchantAssetAllowlist_merchantId_idx" ON "MerchantAssetAllowlist" ("merchantId");

CREATE TABLE IF NOT EXISTS "PaymentIntent" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "merchantId" TEXT NOT NULL,
  amount DECIMAL(20, 9) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'SOL',
  status "PaymentIntentStatus" NOT NULL DEFAULT 'PENDING',
  signature TEXT UNIQUE,
  "chainId" TEXT NOT NULL DEFAULT 'solana:devnet',
  "assetKind" "AssetKind" NOT NULL DEFAULT 'NATIVE_SOL',
  "mintAddress" TEXT,
  "treasuryAddress" TEXT NOT NULL,
  "evmChainId" INTEGER,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- MUST run before any index on these columns: if "PaymentIntent" was created by an older
-- migration, CREATE TABLE IF NOT EXISTS is skipped and the legacy table may lack new columns.
ALTER TABLE "PaymentIntent" ADD COLUMN IF NOT EXISTS "chainId" TEXT NOT NULL DEFAULT 'solana:devnet';
ALTER TABLE "PaymentIntent" ADD COLUMN IF NOT EXISTS "assetKind" "AssetKind" NOT NULL DEFAULT 'NATIVE_SOL';
ALTER TABLE "PaymentIntent" ADD COLUMN IF NOT EXISTS "mintAddress" TEXT;
ALTER TABLE "PaymentIntent" ADD COLUMN IF NOT EXISTS "treasuryAddress" TEXT NOT NULL DEFAULT '5CqEX4Z25vtDHfDso4kxxjdYzCrvH8u1cWaHo8UZ5usR';
ALTER TABLE "PaymentIntent" ADD COLUMN IF NOT EXISTS "evmChainId" INTEGER;
ALTER TABLE "PaymentIntent" ADD COLUMN IF NOT EXISTS "payerAddress" TEXT;

CREATE INDEX IF NOT EXISTS "PaymentIntent_merchantId_idx" ON "PaymentIntent" ("merchantId");
CREATE INDEX IF NOT EXISTS "PaymentIntent_status_idx" ON "PaymentIntent" (status);
CREATE INDEX IF NOT EXISTS "PaymentIntent_chainId_idx" ON "PaymentIntent" ("chainId");
CREATE INDEX IF NOT EXISTS "PaymentIntent_payerAddress_idx" ON "PaymentIntent" ("payerAddress");

-- Seed demo merchant + USDC on Solana devnet (optional)
INSERT INTO "Merchant" (id) VALUES ('k-intent-demo') ON CONFLICT (id) DO NOTHING;
INSERT INTO "MerchantAssetAllowlist" (id, "merchantId", "chainId", mint, decimals, symbol)
VALUES (
  gen_random_uuid(),
  'k-intent-demo',
  'solana:devnet',
  '4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU',
  6,
  'USDC'
)
ON CONFLICT ("merchantId", "chainId", mint) DO NOTHING;
