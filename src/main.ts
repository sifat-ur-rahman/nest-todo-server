import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { Logger, ValidationPipe, VersioningType } from '@nestjs/common';
import helmet from 'helmet';
import compression from 'compression';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    // Structured logging; swap for a proper logger (pino/winston) in prod if needed
    logger: ['error', 'warn', 'log'],
  });

  const config = app.get(ConfigService);
  const apiPrefix = config.get<string>('apiPrefix')!;
  const corsOrigin = config.get<string>('corsOrigin')!;
  const port = config.get<number>('port')!;

  // Security headers (equivalent to app.use(helmet()) in Express)
  app.use(helmet());
  app.use(compression());

  app.enableCors({
    origin: corsOrigin === '*' ? true : corsOrigin.split(','),
    credentials: true,
  });

  app.setGlobalPrefix(apiPrefix);

  // class-validator DTO validation on every incoming request body
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // strips properties not declared in the DTO
      forbidNonWhitelisted: true, // throws if extra properties are sent
      transform: true, // auto-converts payloads to DTO class instances
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalInterceptors(new TransformInterceptor());

  app.enableShutdownHooks(); // graceful shutdown on SIGTERM/SIGINT

  await app.listen(port);
  Logger.log(`🚀 Server running on http://localhost:${port}/${apiPrefix}`, 'Bootstrap');
}

bootstrap();
