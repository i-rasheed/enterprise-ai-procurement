import { NestFactory } from '@nestjs/core';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { Logger } from 'nestjs-pino';
import helmet from 'helmet';
import compression from 'compression';

import { AppModule } from './app.module';
import { initTelemetry } from './instrumentation';

async function bootstrap() {
  initTelemetry();

  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
    rawBody: true,
  });
  app.useLogger(app.get(Logger));

  const configService = app.get(ConfigService);
  const corsOrigins = configService.get<string>(
    'CORS_ORIGINS',
    'http://localhost:3000',
  );

  app.use(helmet());
  app.use(compression());
  app.enableCors({
    origin: corsOrigins.split(',').map((o) => o.trim()),
    credentials: true,
  });

  app.setGlobalPrefix('api');
  app.enableVersioning({ type: VersioningType.URI, defaultVersion: '1' });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('SpendWise API')
    .setDescription(
      'Multi-tenant Enterprise Procurement Management Platform API. Production-hardened with audit logging, rate limiting, and observability.',
    )
    .setVersion('1.0.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Paste the accessToken returned from POST /auth/login',
      },
      'JWT-auth',
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      defaultModelExpandDepth: 2,
      docExpansion: 'list',
      tryItOutEnabled: true,
    },
  });

  const port = configService.get<number>('PORT', 3001);
  await app.listen(port);

  const logger = app.get(Logger);
  logger.log(`API running at http://localhost:${port}/api/v1`);
  logger.log(`Swagger available at http://localhost:${port}/docs`);
}

void bootstrap();
