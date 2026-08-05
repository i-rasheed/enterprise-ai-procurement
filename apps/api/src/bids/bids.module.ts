import { Module } from '@nestjs/common';

import { AuthModule } from '../auth/auth.module';
import { DatabaseModule } from '../database/database.module';
import { RFQsModule } from '../rfqs/rfqs.module';
import { VendorsModule } from '../vendors/vendors.module';
import { BidRepository } from './bid.repository';
import {
  BidsController,
  RfqBidsController,
  VendorBidsController,
} from './bids.controller';
import { BidsService } from './bids.service';

@Module({
  imports: [DatabaseModule, AuthModule, RFQsModule, VendorsModule],
  controllers: [BidsController, VendorBidsController, RfqBidsController],
  providers: [BidsService, BidRepository],
  exports: [BidsService, BidRepository],
})
export class BidsModule {}
