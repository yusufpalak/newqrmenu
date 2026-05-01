import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);
  const port = parseInt(configService.get<string>('PORT', '3001'), 10);

  const corsOriginRaw = configService.get<string>(
    'CORS_ORIGIN',
    'http://localhost:3000',
  );
  const corsOrigin = corsOriginRaw.includes(',')
    ? corsOriginRaw.split(',').map((o) => o.trim())
    : corsOriginRaw;

  app.enableCors({
    origin: corsOrigin,
    credentials: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    allowedHeaders: 'Content-Type,Authorization,x-tenant-id',
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  app.setGlobalPrefix('api');

  await app.listen(port);
  Logger.log(`Backend running on http://localhost:${port}/api`, 'Bootstrap');
}

void bootstrap();
