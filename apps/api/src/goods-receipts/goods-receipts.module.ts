import { Module } from '@nestjs/common';

import { AuthModule } from '../auth/auth.module';
import { DatabaseModule } from '../database/database.module';
import { PurchaseOrdersModule } from '../purchase-orders/purchase-orders.module';
import { GoodsReceiptRepository } from './goods-receipt.repository';
import {
  GoodsReceiptsController,
  PurchaseOrderGoodsReceiptsController,
} from './goods-receipts.controller';
import { GoodsReceiptsService } from './goods-receipts.service';

@Module({
  imports: [DatabaseModule, AuthModule, PurchaseOrdersModule],
  controllers: [GoodsReceiptsController, PurchaseOrderGoodsReceiptsController],
  providers: [GoodsReceiptsService, GoodsReceiptRepository],
  exports: [GoodsReceiptsService, GoodsReceiptRepository],
})
export class GoodsReceiptsModule {}
