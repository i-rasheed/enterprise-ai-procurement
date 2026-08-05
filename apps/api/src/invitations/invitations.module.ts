import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { AuthModule } from '../auth/auth.module';
import { BillingModule } from '../billing/billing.module';
import { DatabaseModule } from '../database/database.module';
import { JobsModule } from '../jobs/jobs.module';
import { OrganisationsModule } from '../organisations/organisations.module';
import { UsersModule } from '../users/users.module';
import { InvitationRepository } from './invitation.repository';
import { InvitationsController } from './invitations.controller';
import { InvitationsService } from './invitations.service';
import { OrganisationInvitationsController } from './organisation-invitations.controller';

@Module({
  imports: [
    ConfigModule,
    DatabaseModule,
    AuthModule,
    UsersModule,
    OrganisationsModule,
    BillingModule,
    JobsModule,
  ],
  controllers: [OrganisationInvitationsController, InvitationsController],
  providers: [InvitationsService, InvitationRepository],
  exports: [InvitationsService, InvitationRepository],
})
export class InvitationsModule {}
