import { Module } from '@nestjs/common';

import { AuthModule } from '../auth/auth.module';
import { DatabaseModule } from '../database/database.module';
import { ProcurementModule } from '../procurement/procurement.module';
import { VendorsModule } from '../vendors/vendors.module';
import { RFQRepository } from './rfq.repository';
import { RFQsController } from './rfqs.controller';
import { RFQService } from './rfqs.service';

@Module({
  imports: [DatabaseModule, AuthModule, ProcurementModule, VendorsModule],
  controllers: [RFQsController],
  providers: [RFQService, RFQRepository],
  exports: [RFQService, RFQRepository],
})
export class RFQsModule {}
