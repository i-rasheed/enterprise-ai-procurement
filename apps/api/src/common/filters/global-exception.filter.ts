import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request, Response } from 'express';

import type { EnvConfig } from '../../config/env.schema';
import { CORRELATION_ID_HEADER } from '../constants/http.constants';
import { formatErrorMessage, shouldFormatForClient } from '../utils/format-error-message.util';

type ApiErrorResponse = {
  success: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
  meta: {
    correlationId?: string;
    timestamp: string;
    path: string;
  };
};

const QUIET_NOT_FOUND_PATHS = new Set([
  '/service-worker.js',
  '/sw.js',
  '/favicon.ico',
  '/robots.txt',
  '/manifest.webmanifest',
]);

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  constructor(private readonly configService: ConfigService) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request & { correlationId?: string }>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const exceptionResponse =
      exception instanceof HttpException ? exception.getResponse() : null;

    let message = 'Internal server error';
    let details: unknown;

    if (typeof exceptionResponse === 'string') {
      message = exceptionResponse;
    } else if (
      exceptionResponse &&
      typeof exceptionResponse === 'object' &&
      'message' in exceptionResponse
    ) {
      message = Array.isArray(exceptionResponse.message)
        ? exceptionResponse.message.join(', ')
        : String(exceptionResponse.message);
      details = exceptionResponse;
    } else if (exception instanceof Error) {
      message = exception.message;
    }

    if (shouldFormatForClient(message, status)) {
      message = formatErrorMessage(message);
    }

    const correlationId =
      request.correlationId ??
      (request.headers[CORRELATION_ID_HEADER] as string | undefined);

    const enabled = this.configService.get<
      EnvConfig['ENABLE_RESPONSE_WRAPPER']
    >('ENABLE_RESPONSE_WRAPPER', true);

    const logLine = `${request.method} ${request.url} ${status} - ${message}`;
    const isQuietNotFound =
      status === HttpStatus.NOT_FOUND &&
      QUIET_NOT_FOUND_PATHS.has(request.path);

    if (isQuietNotFound) {
      this.logger.debug(logLine);
    } else if (status >= 500) {
      this.logger.error(
        logLine,
        exception instanceof Error ? exception.stack : undefined,
      );
    } else if (status >= 400) {
      this.logger.warn(logLine);
    } else {
      this.logger.log(logLine);
    }

    if (!enabled) {
      response.status(status).json({ statusCode: status, message });
      return;
    }

    const body: ApiErrorResponse = {
      success: false,
      error: {
        code: HttpStatus[status] ?? 'ERROR',
        message,
        details: status < 500 ? details : undefined,
      },
      meta: {
        correlationId,
        timestamp: new Date().toISOString(),
        path: request.url,
      },
    };

    response.status(status).json(body);
  }
}
