import { Module } from '@nestjs/common';

import { AuthModule } from '../auth/auth.module';
import { DatabaseModule } from '../database/database.module';
import { GoodsReceiptsModule } from '../goods-receipts/goods-receipts.module';
import { PurchaseOrdersModule } from '../purchase-orders/purchase-orders.module';
import { VendorsModule } from '../vendors/vendors.module';
import { InvoiceRepository } from './invoice.repository';
import {
  InvoicesController,
  MatchingResultsController,
} from './invoices.controller';
import { InvoicesService } from './invoices.service';

@Module({
  imports: [
    DatabaseModule,
    AuthModule,
    PurchaseOrdersModule,
    GoodsReceiptsModule,
    VendorsModule,
  ],
  controllers: [InvoicesController, MatchingResultsController],
  providers: [InvoicesService, InvoiceRepository],
  exports: [InvoicesService, InvoiceRepository],
})
export class InvoicesModule {}
