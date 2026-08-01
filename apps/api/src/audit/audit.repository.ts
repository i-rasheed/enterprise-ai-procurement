import { Injectable } from '@nestjs/common';
import { AuditAction, Prisma } from '@prisma/client';

import { PrismaService } from '../database/prisma.service';

export type AuditLogInput = {
  action: AuditAction;
  organisationId?: string | null;
  userId?: string | null;
  entityType?: string;
  entityId?: string;
  metadata?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
  correlationId?: string;
};

@Injectable()
export class AuditRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(data: AuditLogInput) {
    return this.prisma.auditLog.create({
      data: {
        action: data.action,
        organisationId: data.organisationId ?? undefined,
        userId: data.userId ?? undefined,
        entityType: data.entityType,
        entityId: data.entityId,
        metadata: data.metadata as Prisma.InputJsonValue | undefined,
        ipAddress: data.ipAddress,
        userAgent: data.userAgent,
        correlationId: data.correlationId,
      },
    });
  }

  findByOrganisation(organisationId: string, limit = 100) {
    return this.prisma.auditLog.findMany({
      where: { organisationId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  recordLoginAttempt(
    email: string,
    success: boolean,
    ipAddress?: string,
    userAgent?: string,
  ) {
    return this.prisma.loginAttempt.create({
      data: { email, success, ipAddress, userAgent },
    });
  }
}
