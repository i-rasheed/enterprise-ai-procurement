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
    try {
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
    } catch (error) {
      this.logger.warn(
        `Audit log skipped: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
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
      | 'AUTH_PASSWORD_RESET_REQUEST'
      | 'AUTH_PASSWORD_RESET'
      | 'AUTH_EMAIL_VERIFICATION_SENT'
      | 'AUTH_EMAIL_VERIFIED'
    >,
    context: Omit<AuditLogInput, 'action'>,
  ) {
    return this.log({ ...context, action });
  }

  logBusiness(action: AuditAction, context: Omit<AuditLogInput, 'action'>) {
    return this.log({ ...context, action });
  }

  async listForOrganisation(
    organisationId: string,
    page: number,
    limit: number,
  ) {
    const [logs, total] =
      await this.auditRepository.findByOrganisationPaginated(
        organisationId,
        page,
        limit,
      );

    return {
      logs: logs.map((log) => ({
        id: log.id,
        organisationId: log.organisationId,
        userId: log.userId,
        action: log.action,
        entityType: log.entityType,
        entityId: log.entityId,
        metadata: log.metadata as Record<string, unknown> | null,
        createdAt: log.createdAt.toISOString(),
      })),
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit) || 1,
    };
  }

  async recordLoginAttempt(
    email: string,
    success: boolean,
    ipAddress?: string,
    userAgent?: string,
  ) {
    try {
      return await this.auditRepository.recordLoginAttempt(
        email,
        success,
        ipAddress,
        userAgent,
      );
    } catch (error) {
      this.logger.warn(
        `Login attempt log skipped: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }
}
