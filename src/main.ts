// src/main.ts

import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './exceptions/all-exceptions.filter';
import { PinoLogger } from 'nestjs-pino';
import { collectDefaultMetrics } from 'prom-client';
import { MetricsInterceptor } from './common/metrics.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  app.enableCors();

  // Registre o filtro de exceção globalmente
  app.useGlobalFilters(new AllExceptionsFilter());
  app.useGlobalInterceptors(new MetricsInterceptor());

  await app.listen(3000);
}
bootstrap();
