import { Injectable, NotFoundException } from '@nestjs/common';
import { BillingStatus, Prisma, SubscriptionPlan } from '@prisma/client';

import { PrismaService } from '../database/prisma.service';
import { UpdateOrganisationPlanDto } from './dto/update-organisation-plan.dto';
import { UpdateSystemSettingDto } from './dto/update-system-setting.dto';

@Injectable()
export class PlatformService {
  constructor(private readonly prisma: PrismaService) {}

  async getDashboard() {
    const [organisations, users, openTickets, activeSubscriptions] =
      await Promise.all([
        this.prisma.organisation.count(),
        this.prisma.user.count(),
        this.prisma.supportTicket.count({
          where: { status: { in: ['OPEN', 'IN_PROGRESS'] } },
        }),
        this.prisma.organisation.count({
          where: {
            billingStatus: { in: [BillingStatus.ACTIVE, BillingStatus.TRIALING] },
          },
        }),
      ]);

    const planBreakdown = await this.prisma.organisation.groupBy({
      by: ['plan'],
      _count: { plan: true },
    });

    return {
      organisations,
      users,
      openTickets,
      activeSubscriptions,
      planBreakdown,
    };
  }

  async listOrganisations() {
    return this.prisma.organisation.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        _count: { select: { users: true } },
      },
    });
  }

  async updateOrganisationPlan(id: string, dto: UpdateOrganisationPlanDto) {
    const organisation = await this.prisma.organisation.findUnique({
      where: { id },
    });

    if (!organisation) {
      throw new NotFoundException('Organisation not found');
    }

    return this.prisma.organisation.update({
      where: { id },
      data: {
        plan: dto.plan,
        billingStatus: dto.billingStatus,
        featureOverrides: dto.featureOverrides ?? undefined,
      },
    });
  }

  async listSystemSettings() {
    return this.prisma.systemSetting.findMany({ orderBy: { key: 'asc' } });
  }

  async upsertSystemSetting(dto: UpdateSystemSettingDto) {
    return this.prisma.systemSetting.upsert({
      where: { key: dto.key },
      create: { key: dto.key, value: dto.value as Prisma.InputJsonValue },
      update: { value: dto.value as Prisma.InputJsonValue },
    });
  }
}
