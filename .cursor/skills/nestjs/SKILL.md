# NestJS Skill — K-INTENT Backend
# =========================================
# DROP THIS FILE AT: .cursor/skills/nestjs/SKILL.md
# USAGE: Type @.cursor/skills/nestjs/SKILL.md in Cursor chat when working on backend
# =========================================

## What This Skill Covers
NestJS conventions, module structure, DTOs, guards, interceptors, and API design patterns
for the K-INTENT payment gateway backend.

---

## Project Structure (Backend)

```
backend/
  src/
    app.module.ts               ← Root module, imports all feature modules
    main.ts                     ← Bootstrap, CORS, validation pipe, port
    config/
      config.module.ts          ← ConfigModule setup (global: true)
    prisma/
      prisma.module.ts
      prisma.service.ts         ← PrismaClient wrapper, onModuleInit/Destroy
    solana/
      solana.module.ts
      solana.service.ts         ← ALL web3.js logic lives here ONLY
    intent/
      intent.module.ts
      intent.controller.ts      ← HTTP layer only, no business logic
      intent.service.ts         ← Business logic, calls prisma + solana
      dto/
        create-intent.dto.ts
        verify-intent.dto.ts
      intent.types.ts           ← Interfaces/types for this feature
```

---

## Bootstrap (main.ts)

```typescript
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,        // Strip unknown fields
      forbidNonWhitelisted: true,
      transform: true,        // Auto-transform to DTO types
    }),
  );

  app.setGlobalPrefix('api');

  await app.listen(process.env.PORT ?? 3001);
}
bootstrap();
```

---

## Standard Response Shape

ALL endpoints must return this shape:

```typescript
// shared/types/api-response.ts
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
}

// Helper
export const ok = <T>(data: T, message = 'Success'): ApiResponse<T> => ({
  success: true,
  data,
  message,
});

export const fail = (message: string): ApiResponse<null> => ({
  success: false,
  data: null,
  message,
});
```

---

## DTO Pattern

```typescript
// intent/dto/create-intent.dto.ts
import { IsString, IsNumber, IsPositive, IsNotEmpty } from 'class-validator';

export class CreateIntentDto {
  @IsString()
  @IsNotEmpty()
  merchantId: string;

  @IsNumber()
  @IsPositive()
  amount: number;

  @IsString()
  @IsNotEmpty()
  currency: string; // e.g. "SOL"

  @IsString()
  @IsNotEmpty()
  targetCurrency: string; // e.g. "USDC"
}
```

---

## Controller Pattern

```typescript
// intent/intent.controller.ts
import { Controller, Post, Get, Param, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { IntentService } from './intent.service';
import { CreateIntentDto } from './dto/create-intent.dto';
import { ApiResponse, ok } from '../../shared/types/api-response';

@Controller('intent')
export class IntentController {
  constructor(private readonly intentService: IntentService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createIntent(@Body() dto: CreateIntentDto): Promise<ApiResponse<unknown>> {
    const intent = await this.intentService.createIntent(dto);
    return ok(intent, 'Intent created successfully');
  }

  @Get(':id')
  async getIntent(@Param('id') id: string): Promise<ApiResponse<unknown>> {
    const intent = await this.intentService.getIntentById(id);
    return ok(intent);
  }
}
```

---

## Service Pattern

```typescript
// intent/intent.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SolanaService } from '../solana/solana.service';
import { CreateIntentDto } from './dto/create-intent.dto';

@Injectable()
export class IntentService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly solana: SolanaService,
  ) {}

  async createIntent(dto: CreateIntentDto) {
    try {
      return await this.prisma.paymentIntent.create({
        data: {
          merchantId: dto.merchantId,
          amount: dto.amount,
          currency: dto.currency,
          targetCurrency: dto.targetCurrency,
          status: 'PENDING',
        },
      });
    } catch (error) {
      throw new HttpException('Failed to create intent', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async getIntentById(id: string) {
    const intent = await this.prisma.paymentIntent.findUnique({ where: { id } });
    if (!intent) throw new NotFoundException(`Intent ${id} not found`);
    return intent;
  }
}
```

---

## Module Pattern

```typescript
// intent/intent.module.ts
import { Module } from '@nestjs/common';
import { IntentController } from './intent.controller';
import { IntentService } from './intent.service';
import { PrismaModule } from '../prisma/prisma.module';
import { SolanaModule } from '../solana/solana.module';

@Module({
  imports: [PrismaModule, SolanaModule],
  controllers: [IntentController],
  providers: [IntentService],
})
export class IntentModule {}
```

---

## Error Handling Rules

- Use NestJS built-in exceptions: `NotFoundException`, `BadRequestException`, `ConflictException`, `InternalServerErrorException`
- Never throw raw `Error` objects from services
- Wrap all Prisma calls in try/catch
- Log errors using NestJS `Logger`, not `console.log`

```typescript
import { Logger } from '@nestjs/common';
private readonly logger = new Logger(IntentService.name);
// Then: this.logger.error('message', error.stack);
```

---

## Required Packages

```bash
npm install @nestjs/common @nestjs/core @nestjs/platform-express
npm install @nestjs/config
npm install class-validator class-transformer
npm install @prisma/client
npm install @solana/web3.js
npm install --save-dev @nestjs/cli typescript @types/node prisma
```

---

## Environment Variables Required

```env
DATABASE_URL=postgresql://user:password@localhost:5432/kintent
PORT=3001
FRONTEND_URL=http://localhost:3000
SOLANA_RPC_URL=https://api.devnet.solana.com
MERCHANT_WALLET_ADDRESS=your_devnet_wallet_address_here
```