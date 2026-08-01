import { Module } from '@nestjs/common';

import { AuthModule } from '../auth/auth.module';
import { BidEvaluationsModule } from '../bid-evaluations/bid-evaluations.module';
import { DatabaseModule } from '../database/database.module';
import { VendorsModule } from '../vendors/vendors.module';
import { PurchaseOrderRepository } from './purchase-order.repository';
import {
  PurchaseOrdersController,
  VendorPurchaseOrdersController,
} from './purchase-orders.controller';
import { PurchaseOrdersService } from './purchase-orders.service';

@Module({
  imports: [DatabaseModule, AuthModule, BidEvaluationsModule, VendorsModule],
  controllers: [PurchaseOrdersController, VendorPurchaseOrdersController],
  providers: [PurchaseOrdersService, PurchaseOrderRepository],
  exports: [PurchaseOrdersService, PurchaseOrderRepository],
})
export class PurchaseOrdersModule {}
