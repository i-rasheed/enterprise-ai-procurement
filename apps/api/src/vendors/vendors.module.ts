import { Module } from '@nestjs/common';

import { AuthModule } from '../auth/auth.module';
import { DatabaseModule } from '../database/database.module';
import { VendorRepository } from './vendor.repository';
import { VendorsController } from './vendors.controller';
import { VendorsService } from './vendors.service';

@Module({
  imports: [DatabaseModule, AuthModule],
  controllers: [VendorsController],
  providers: [VendorsService, VendorRepository],
  exports: [VendorsService, VendorRepository],
})
export class VendorsModule {}
