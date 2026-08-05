import { SetMetadata } from '@nestjs/common';

import { PlanFeature } from '../../billing/constants/plan.constants';

export const FEATURE_KEY = 'required_feature';
export const RequiresFeature = (...features: PlanFeature[]) =>
  SetMetadata(FEATURE_KEY, features);
