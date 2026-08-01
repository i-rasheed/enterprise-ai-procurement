import { Injectable, Logger } from '@nestjs/common';
import { AuditAction } from '@prisma/client';
import { PinoLogger } from 'nestjs-pino';

import { AuditLogInput, AuditRepository } from './audit.repository';

@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name);

  constructor(
    private readonly auditRepository: AuditRepository,
    private readonly pinoLogger: PinoLogger,
  ) {
    this.pinoLogger.setContext(AuditService.name);
  }

  async log(input: AuditLogInput): Promise<void> {
    await this.auditRepository.create(input);
    this.pinoLogger.info(
      {
        audit: true,
        action: input.action,
        userId: input.userId,
        organisationId: input.organisationId,
        entityType: input.entityType,
        entityId: input.entityId,
        correlationId: input.correlationId,
      },
      `Audit: ${input.action}`,
    );
  }

  logAuth(
    action: Extract<
      AuditAction,
      | 'AUTH_LOGIN'
      | 'AUTH_LOGOUT'
      | 'AUTH_REGISTER'
      | 'AUTH_TOKEN_REFRESH'
      | 'AUTH_TOKEN_REVOKE'
      | 'AUTH_LOGIN_FAILED'
      | 'AUTH_ACCOUNT_LOCKED'
    >,
    context: Omit<AuditLogInput, 'action'>,
  ) {
    return this.log({ ...context, action });
  }

  logBusiness(action: AuditAction, context: Omit<AuditLogInput, 'action'>) {
    return this.log({ ...context, action });
  }

  recordLoginAttempt(
    email: string,
    success: boolean,
    ipAddress?: string,
    userAgent?: string,
  ) {
    return this.auditRepository.recordLoginAttempt(
      email,
      success,
      ipAddress,
      userAgent,
    );
  }
}
