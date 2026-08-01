import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Observable, map } from 'rxjs';

import type { EnvConfig } from '../../config/env.schema';
import { CORRELATION_ID_HEADER } from '../constants/http.constants';

export type ApiResponseMeta = {
  correlationId?: string;
  timestamp: string;
  requestId?: string;
};

export type ApiSuccessResponse<T> = {
  success: true;
  data: T;
  meta: ApiResponseMeta;
};

@Injectable()
export class ResponseTransformInterceptor<T> implements NestInterceptor<
  T,
  ApiSuccessResponse<T> | T
> {
  constructor(private readonly configService: ConfigService) {}

  intercept(
    context: ExecutionContext,
    next: CallHandler<T>,
  ): Observable<ApiSuccessResponse<T> | T> {
    const enabled = this.configService.get<
      EnvConfig['ENABLE_RESPONSE_WRAPPER']
    >('ENABLE_RESPONSE_WRAPPER', true);

    if (!enabled) {
      return next.handle();
    }

    const request = context.switchToHttp().getRequest<{
      headers: Record<string, string | undefined>;
      correlationId?: string;
    }>();

    const correlationId =
      request.correlationId ??
      request.headers[CORRELATION_ID_HEADER] ??
      undefined;

    return next.handle().pipe(
      map((data) => ({
        success: true as const,
        data,
        meta: {
          correlationId,
          timestamp: new Date().toISOString(),
        },
      })),
    );
  }
}
