import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { BillingStatus } from '@prisma/client';

import { JwtPayload } from '../../common/types/jwt-payload.interface';
import { PrismaService } from '../../database/prisma.service';

const ACTIVE_STATUSES: BillingStatus[] = [
  BillingStatus.TRIALING,
  BillingStatus.ACTIVE,
  BillingStatus.PAST_DUE,
];

@Injectable()
export class TenantBillingGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<{ user?: JwtPayload }>();
    const organisationId = request.user?.organisationId;

    if (!organisationId) {
      throw new ForbiddenException('Tenant context required');
    }

    const organisation = await this.prisma.organisation.findUnique({
      where: { id: organisationId },
      select: {
        billingStatus: true,
        trialEndsAt: true,
      },
    });

    if (!organisation) {
      throw new ForbiddenException('Organisation not found');
    }

    if (
      organisation.billingStatus === BillingStatus.TRIALING &&
      organisation.trialEndsAt &&
      organisation.trialEndsAt < new Date()
    ) {
      throw new ForbiddenException('Trial expired. Upgrade to continue.');
    }

    if (!ACTIVE_STATUSES.includes(organisation.billingStatus)) {
      throw new ForbiddenException('Subscription inactive');
    }

    return true;
  }
}
