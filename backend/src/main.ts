import 'reflect-metadata';
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);
  const configuredOrigins = process.env.FRONTEND_URL?.split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
  const fallbackOrigins = [
    'http://localhost:3000',
    'http://localhost:3001',
    'https://kira-clone-frontend.onrender.com',
  ];
  const allowedOrigins = configuredOrigins?.length ? configuredOrigins : fallbackOrigins;

  /** Global validation: DTO class-validator rules + stripped unknown fields. */
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  app.enableCors({
    origin: allowedOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-api-key'],
  });

  await app.listen(process.env.PORT ?? 3000);
}

void bootstrap();
