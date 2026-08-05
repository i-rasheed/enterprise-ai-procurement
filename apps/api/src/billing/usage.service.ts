import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UsageMetric } from '@prisma/client';

import { PrismaService } from '../database/prisma.service';
import {
  METRIC_TO_LIMIT_KEY,
  PLAN_LIMITS,
} from './constants/plan.constants';

@Injectable()
export class UsageService {
  constructor(private readonly prisma: PrismaService) {}

  private currentPeriod() {
    const now = new Date();
    const periodStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
    return { periodStart, periodEnd };
  }

  async getUsageSummary(organisationId: string) {
    const organisation = await this.prisma.organisation.findUnique({
      where: { id: organisationId },
      include: {
        _count: { select: { users: true, procurementRequests: true } },
      },
    });

    if (!organisation) {
      throw new NotFoundException('Organisation not found');
    }

    const limits = PLAN_LIMITS[organisation.plan];
    const { periodStart, periodEnd } = this.currentPeriod();

    const aiUsage = await this.prisma.usageSnapshot.findUnique({
      where: {
        organisationId_metric_periodStart: {
          organisationId,
          metric: UsageMetric.AI_REQUESTS,
          periodStart,
        },
      },
    });

    const metrics = [
      {
        metric: UsageMetric.USERS,
        used: organisation._count.users,
        limit: limits.users,
      },
      {
        metric: UsageMetric.PROCUREMENT_REQUESTS,
        used: organisation._count.procurementRequests,
        limit: limits.procurementRequests,
      },
      {
        metric: UsageMetric.AI_REQUESTS,
        used: aiUsage?.value ?? 0,
        limit: limits.aiRequests,
      },
    ];

    return {
      plan: organisation.plan,
      periodStart,
      periodEnd,
      metrics,
    };
  }

  async assertWithinLimit(organisationId: string, metric: UsageMetric) {
    const summary = await this.getUsageSummary(organisationId);
    const entry = summary.metrics.find((item) => item.metric === metric);

    if (!entry || entry.limit < 0) {
      return;
    }

    if (entry.used >= entry.limit) {
      throw new ForbiddenException(
        `Plan limit reached for ${metric.toLowerCase().replace('_', ' ')}`,
      );
    }
  }

  async incrementUsage(organisationId: string, metric: UsageMetric, amount = 1) {
    const organisation = await this.prisma.organisation.findUnique({
      where: { id: organisationId },
    });

    if (!organisation) {
      throw new NotFoundException('Organisation not found');
    }

    const { periodStart, periodEnd } = this.currentPeriod();

    await this.prisma.usageSnapshot.upsert({
      where: {
        organisationId_metric_periodStart: {
          organisationId,
          metric,
          periodStart,
        },
      },
      create: {
        organisationId,
        metric,
        value: amount,
        periodStart,
        periodEnd,
      },
      update: {
        value: { increment: amount },
      },
    });

    await this.assertWithinLimit(organisationId, metric);
  }

  isWithinLimit(
    plan: keyof typeof PLAN_LIMITS,
    metric: UsageMetric,
    used: number,
  ): boolean {
    const limitKey = METRIC_TO_LIMIT_KEY[metric];
    const limit = PLAN_LIMITS[plan][limitKey];
    return limit < 0 || used < limit;
  }
}
