import { Module } from '@nestjs/common';

import { DatabaseModule } from '../database/database.module';
import { SupportModule } from '../support/support.module';
import { UsersModule } from '../users/users.module';
import { PlatformAdminGuard } from './guards/platform-admin.guard';
import { PlatformController } from './platform.controller';
import { PlatformService } from './platform.service';

@Module({
  imports: [DatabaseModule, UsersModule, SupportModule],
  controllers: [PlatformController],
  providers: [PlatformService, PlatformAdminGuard],
  exports: [PlatformService, PlatformAdminGuard, UsersModule],
})
export class PlatformModule {}
