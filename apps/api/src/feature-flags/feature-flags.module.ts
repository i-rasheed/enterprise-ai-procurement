import { Module } from '@nestjs/common';

import { DatabaseModule } from '../database/database.module';
import {
  FeatureFlagGuard,
} from './feature-flag.guard';
import { FeatureFlagService } from './feature-flag.service';
import { FeatureFlagsController } from './feature-flags.controller';

@Module({
  imports: [DatabaseModule],
  controllers: [FeatureFlagsController],
  providers: [FeatureFlagService, FeatureFlagGuard],
  exports: [FeatureFlagService, FeatureFlagGuard],
})
export class FeatureFlagsModule {}
