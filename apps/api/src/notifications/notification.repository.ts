import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';

import { PrismaService } from '../database/prisma.service';

@Injectable()
export class NotificationRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(data: {
    userId: string;
    organisationId: string;
    type: string;
    title: string;
    message: string;
    metadata?: Record<string, unknown>;
  }) {
    return this.prisma.notification.create({
      data: {
        ...data,
        metadata: data.metadata as Prisma.InputJsonValue | undefined,
      },
    });
  }

  findByUser(userId: string, unreadOnly = false) {
    return this.prisma.notification.findMany({
      where: { userId, ...(unreadOnly ? { read: false } : {}) },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  }

  markRead(id: string, userId: string) {
    return this.prisma.notification.updateMany({
      where: { id, userId },
      data: { read: true },
    });
  }

  getPreferences(userId: string) {
    return this.prisma.notificationPreference.findUnique({ where: { userId } });
  }

  upsertPreferences(
    userId: string,
    emailEnabled: boolean,
    inAppEnabled: boolean,
  ) {
    return this.prisma.notificationPreference.upsert({
      where: { userId },
      create: { userId, emailEnabled, inAppEnabled },
      update: { emailEnabled, inAppEnabled },
    });
  }
}
