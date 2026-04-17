-- Run once in Supabase → SQL Editor (manual schema; no prisma db push).
-- Then: npm run prisma:generate

CREATE TYPE "PaymentIntentStatus" AS ENUM ('PENDING', 'SUCCESS', 'FAILED');

CREATE TABLE "PaymentIntent" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "merchantId" TEXT NOT NULL,
  amount DECIMAL(20, 9) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'SOL',
  status "PaymentIntentStatus" NOT NULL DEFAULT 'PENDING',
  signature TEXT UNIQUE,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX "PaymentIntent_merchantId_idx" ON "PaymentIntent" ("merchantId");
CREATE INDEX "PaymentIntent_status_idx" ON "PaymentIntent" (status);
