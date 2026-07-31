import { Module } from '@nestjs/common';

import { AuthModule } from '../auth/auth.module';
import { DatabaseModule } from '../database/database.module';
import { OrganisationRepository } from './organisation.repository';
import { OrganisationsController } from './organisations.controller';
import { OrganisationsService } from './organisations.service';

@Module({
  imports: [DatabaseModule, AuthModule],
  controllers: [OrganisationsController],
  providers: [OrganisationsService, OrganisationRepository],
  exports: [OrganisationsService],
})
export class OrganisationsModule {}
