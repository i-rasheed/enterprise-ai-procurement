import { Module } from '@nestjs/common';

import { AuthModule } from '../auth/auth.module';
import { BidsModule } from '../bids/bids.module';
import { DatabaseModule } from '../database/database.module';
import { ProcurementModule } from '../procurement/procurement.module';
import { BidEvaluationService } from './bid-evaluation.service';
import {
  AwardsController,
  BidEvaluationsController,
  ProcurementRankingsController,
} from './bid-evaluations.controller';
import { EvaluationRepository } from './evaluation.repository';

@Module({
  imports: [DatabaseModule, AuthModule, BidsModule, ProcurementModule],
  controllers: [
    BidEvaluationsController,
    ProcurementRankingsController,
    AwardsController,
  ],
  providers: [BidEvaluationService, EvaluationRepository],
  exports: [BidEvaluationService, EvaluationRepository],
})
export class BidEvaluationsModule {}
