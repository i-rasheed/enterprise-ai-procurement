import { Injectable } from '@nestjs/common';

import { PrismaService } from '../database/prisma.service';
import {
  PLAN_FEATURES,
  PlanFeature,
} from '../billing/constants/plan.constants';

@Injectable()
export class FeatureFlagService {
  constructor(private readonly prisma: PrismaService) {}

  async getFeatures(organisationId: string): Promise<PlanFeature[]> {
    const organisation = await this.prisma.organisation.findUnique({
      where: { id: organisationId },
    });

    if (!organisation) {
      return [];
    }

    const base = PLAN_FEATURES[organisation.plan];
    const overrides = organisation.featureOverrides as Record<string, boolean>;

    const enabled = new Set(base);

    for (const [feature, isEnabled] of Object.entries(overrides)) {
      if (isEnabled) {
        enabled.add(feature as PlanFeature);
      } else {
        enabled.delete(feature as PlanFeature);
      }
    }

    return [...enabled];
  }

  async hasFeature(organisationId: string, feature: PlanFeature): Promise<boolean> {
    const features = await this.getFeatures(organisationId);
    return features.includes(feature);
  }
}
