import { Module } from '@nestjs/common';

import { AuthModule } from '../auth/auth.module';
import { BillingModule } from '../billing/billing.module';
import { DatabaseModule } from '../database/database.module';
import { OrganisationsModule } from '../organisations/organisations.module';
import { UsersModule } from '../users/users.module';
import { InvitationRepository } from './invitation.repository';
import { InvitationsController } from './invitations.controller';
import { InvitationsService } from './invitations.service';
import { OrganisationInvitationsController } from './organisation-invitations.controller';

@Module({
  imports: [DatabaseModule, AuthModule, UsersModule, OrganisationsModule, BillingModule],
  controllers: [OrganisationInvitationsController, InvitationsController],
  providers: [InvitationsService, InvitationRepository],
  exports: [InvitationsService, InvitationRepository],
})
export class InvitationsModule {}
