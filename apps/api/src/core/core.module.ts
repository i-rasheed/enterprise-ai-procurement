import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER, APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core';
import { ThrottlerModule } from '@nestjs/throttler';
import { LoggerModule } from 'nestjs-pino';

import { GlobalExceptionFilter } from '../common/filters/global-exception.filter';
import { ResponseTransformInterceptor } from '../common/interceptors/response-transform.interceptor';
import { SanitizeInputPipe } from '../common/pipes/sanitize-input.pipe';
import envValidation from '../config/env.validation';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['../../.env', '.env'],
      validate: envValidation,
    }),
    LoggerModule.forRoot({
      pinoHttp: {
        level: process.env.LOG_LEVEL ?? 'info',
        transport:
          process.env.NODE_ENV !== 'production'
            ? { target: 'pino-pretty', options: { colorize: true } }
            : undefined,
        autoLogging: true,
        redact: ['req.headers.authorization', 'req.headers.cookie'],
        customProps: (req) => ({
          correlationId: (req as { correlationId?: string }).correlationId,
        }),
      },
    }),
    ThrottlerModule.forRoot([
      {
        name: 'default',
        ttl: parseInt(process.env.RATE_LIMIT_TTL ?? '60000', 10),
        limit: parseInt(process.env.RATE_LIMIT_MAX ?? '100', 10),
      },
    ]),
  ],
  providers: [
    {
      provide: APP_FILTER,
      useClass: GlobalExceptionFilter,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: ResponseTransformInterceptor,
    },
    {
      provide: APP_PIPE,
      useClass: SanitizeInputPipe,
    },
  ],
  exports: [ConfigModule, LoggerModule, ThrottlerModule],
})
export class CoreModule {}
