import { Module } from '@nestjs/common';

import { DatabaseModule } from '../database/database.module';
import { BillingController, BillingWebhookController } from './billing.controller';
import { BillingService } from './billing.service';
import { UsageService } from './usage.service';

@Module({
  imports: [DatabaseModule],
  controllers: [BillingController, BillingWebhookController],
  providers: [BillingService, UsageService],
  exports: [BillingService, UsageService],
})
export class BillingModule {}
