import { Module } from '@nestjs/common';

import { AuthModule } from '../auth/auth.module';
import { BidEvaluationsModule } from '../bid-evaluations/bid-evaluations.module';
import { DatabaseModule } from '../database/database.module';
import { PurchaseOrdersModule } from '../purchase-orders/purchase-orders.module';
import { ContractRepository } from './contract.repository';
import { ContractsController } from './contracts.controller';
import { ContractsService } from './contracts.service';

@Module({
  imports: [
    DatabaseModule,
    AuthModule,
    BidEvaluationsModule,
    PurchaseOrdersModule,
  ],
  controllers: [ContractsController],
  providers: [ContractsService, ContractRepository],
  exports: [ContractsService, ContractRepository],
})
export class ContractsModule {}
