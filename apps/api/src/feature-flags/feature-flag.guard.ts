import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { JwtPayload } from '../common/types/jwt-payload.interface';
import { PlanFeature } from '../billing/constants/plan.constants';
import { FEATURE_KEY } from './decorators/requires-feature.decorator';
import { FeatureFlagService } from './feature-flag.service';

@Injectable()
export class FeatureFlagGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly featureFlagService: FeatureFlagService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const required = this.reflector.getAllAndOverride<PlanFeature[]>(
      FEATURE_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!required?.length) {
      return true;
    }

    const request = context.switchToHttp().getRequest<{ user?: JwtPayload }>();
    const organisationId = request.user?.organisationId;

    if (!organisationId) {
      throw new ForbiddenException('Tenant context required');
    }

    const features = await this.featureFlagService.getFeatures(organisationId);
    const allowed = required.every((feature) => features.includes(feature));

    if (!allowed) {
      throw new ForbiddenException('Feature not available on current plan');
    }

    return true;
  }
}
