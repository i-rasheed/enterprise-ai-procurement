import { NestFactory } from '@nestjs/core';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api');

  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('Enterprise AI Procurement API')
    .setDescription(
      'Multi-tenant Enterprise Procurement Management Platform API. Use the sample requests provided on each endpoint to get started quickly.',
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
      defaultModelsExpandDepth: 2,
      docExpansion: 'list',
      tryItOutEnabled: true,
    },
  });

  const port = process.env.PORT ?? 3001;

  await app.listen(port);

  console.log(`🚀 API running at http://localhost:${port}/api/v1`);
  console.log(`📚 Swagger available at http://localhost:${port}/docs`);
}

void bootstrap();
