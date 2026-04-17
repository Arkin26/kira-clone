# Prisma Skill — K-INTENT Database Layer
# =========================================
# DROP THIS FILE AT: .cursor/skills/prisma/SKILL.md
# USAGE: Type @.cursor/skills/prisma/SKILL.md in Cursor chat when working on DB/schema
# =========================================

## What This Skill Covers
Prisma ORM setup, schema design, PrismaService pattern, migrations, and query best practices
for the K-INTENT PostgreSQL database.

---

## Schema (schema.prisma)

```prisma
// backend/prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

enum Status {
  PENDING
  SUCCESS
  FAILED
}

model PaymentIntent {
  id             String   @id @default(cuid())
  merchantId     String
  amount         Float
  currency       String        // e.g. "SOL"
  targetCurrency String        // e.g. "USDC"
  status         Status   @default(PENDING)
  signature      String?  @unique  // Solana Tx Hash — unique prevents replay attacks
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt

  // Indexes for frequently queried fields
  @@index([merchantId])
  @@index([status])
  @@index([signature])
}
```

---

## PrismaService (The Standard Wrapper)

```typescript
// backend/src/prisma/prisma.service.ts
import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  async onModuleInit(): Promise<void> {
    await this.$connect();
  }

  async onModuleDestroy(): Promise<void> {
    await this.$disconnect();
  }
}
```

```typescript
// backend/src/prisma/prisma.module.ts
import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Global() // Makes PrismaService available everywhere without re-importing
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
```

---

## Query Patterns

### Create a new PaymentIntent
```typescript
const intent = await this.prisma.paymentIntent.create({
  data: {
    merchantId,
    amount,
    currency,
    targetCurrency,
    status: 'PENDING',
  },
});
```

### Find by ID (with not-found handling)
```typescript
const intent = await this.prisma.paymentIntent.findUnique({
  where: { id },
});
if (!intent) throw new NotFoundException(`Intent ${id} not found`);
```

### Update status to SUCCESS (idempotent with upsert-style check)
```typescript
// Use updateMany to avoid crashing if already updated
const result = await this.prisma.paymentIntent.updateMany({
  where: {
    id: intentId,
    status: 'PENDING', // Only update if still pending — prevents double-processing
  },
  data: {
    status: 'SUCCESS',
    signature: txSignature,
  },
});

if (result.count === 0) {
  // Already processed or not found — handle gracefully
  this.logger.warn(`Intent ${intentId} was already processed or not found`);
}
```

### Find by signature (replay attack prevention)
```typescript
const existing = await this.prisma.paymentIntent.findUnique({
  where: { signature: txSignature },
});
if (existing) throw new ConflictException('This transaction has already been used');
```

### Query by merchant with filters
```typescript
const intents = await this.prisma.paymentIntent.findMany({
  where: {
    merchantId,
    status: 'SUCCESS',
  },
  orderBy: { createdAt: 'desc' },
  take: 20, // Always paginate
});
```

---

## Migration Commands

```bash
# After any schema change — creates a new migration file
npx prisma migrate dev --name describe_what_changed

# In production — applies pending migrations
npx prisma migrate deploy

# Regenerate the Prisma client after schema changes
npx prisma generate

# Open Prisma Studio (visual DB browser) for debugging
npx prisma studio

# Reset DB completely (dev only — DESTROYS ALL DATA)
npx prisma migrate reset
```

---

## Rules

1. **Never** call `new PrismaClient()` directly — always inject `PrismaService`
2. **Always** run `npx prisma generate` after schema changes
3. **Always** wrap Prisma calls in try/catch in the service layer
4. Use `updateMany` with status guards to ensure idempotency
5. The `signature` field has `@unique` — this is your replay attack protection, never remove it
6. Never use `prisma.$queryRaw` unless absolutely necessary
7. Always use `select` to limit fields returned when you don't need the full record

```typescript
// Good — only fetch what you need
const intent = await this.prisma.paymentIntent.findUnique({
  where: { id },
  select: { id: true, status: true, signature: true },
});
```

---

## Environment Variable

```env
# .env
DATABASE_URL=postgresql://USER:PASSWORD@HOST:PORT/DATABASE_NAME

# Examples:
# Local:   postgresql://postgres:password@localhost:5432/kintent
# Neon:    postgresql://user:pass@ep-xyz.neon.tech/kintent?sslmode=require
# Supabase: postgresql://postgres:pass@db.xyz.supabase.co:5432/postgres
```