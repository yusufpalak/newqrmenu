import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Serve uploaded files statically at /uploads/*
  app.useStaticAssets(join(process.cwd(), 'uploads'), { prefix: '/uploads' });

  const configService = app.get(ConfigService);
  const port = configService.get('PORT') || 3001;

  // Enable CORS
  const corsOriginRaw = configService.get('CORS_ORIGIN') || 'http://localhost:3000';
  const corsOrigin = corsOriginRaw.includes(',')
    ? corsOriginRaw.split(',').map((o: string) => o.trim())
    : corsOriginRaw;
  app.enableCors({
    origin: corsOrigin,
    credentials: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    allowedHeaders: 'Content-Type,Authorization',
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    })
  );

  // Global prefix for API routes
  app.setGlobalPrefix('api');

  await app.listen(port);
  console.log(`Backend running on http://localhost:${port}`);
}

bootstrap();
