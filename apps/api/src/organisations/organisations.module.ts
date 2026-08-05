import { Module, forwardRef } from '@nestjs/common';

import { AuthModule } from '../auth/auth.module';
import { DatabaseModule } from '../database/database.module';
import { PlatformModule } from '../platform/platform.module';
import { UsersModule } from '../users/users.module';
import { OrganisationRepository } from './organisation.repository';
import { OrganisationsCrudController } from './organisations-crud.controller';
import { OrganisationsController } from './organisations.controller';
import { OrganisationsService } from './organisations.service';

@Module({
  imports: [
    DatabaseModule,
    AuthModule,
    UsersModule,
    forwardRef(() => PlatformModule),
  ],
  controllers: [OrganisationsController, OrganisationsCrudController],
  providers: [OrganisationsService, OrganisationRepository],
  exports: [OrganisationsService, OrganisationRepository],
})
export class OrganisationsModule {}
