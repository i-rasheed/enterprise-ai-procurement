import { Module } from '@nestjs/common';

import { AuthModule } from '../auth/auth.module';
import { DatabaseModule } from '../database/database.module';
import { OrganisationRepository } from './organisation.repository';
import { OrganisationsCrudController } from './organisations-crud.controller';
import { OrganisationsController } from './organisations.controller';
import { OrganisationsService } from './organisations.service';

@Module({
  imports: [DatabaseModule, AuthModule],
  controllers: [OrganisationsCrudController, OrganisationsController],
  providers: [OrganisationsService, OrganisationRepository],
  exports: [OrganisationsService, OrganisationRepository],
})
export class OrganisationsModule {}
