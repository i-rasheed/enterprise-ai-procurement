import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { AppController } from './app.controller';
import { AppService } from './app.service';

import { HealthModule } from './health/health.module';
import { DatabaseModule } from './database/database.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { OrganisationsModule } from './organisations/organisations.module';
import { InvitationsModule } from './invitations/invitations.module';
import { VendorsModule } from './vendors/vendors.module';
import { ProcurementModule } from './procurement/procurement.module';
import { ApprovalWorkflowsModule } from './approval-workflows/approval-workflows.module';
import { RFQsModule } from './rfqs/rfqs.module';
import { BidsModule } from './bids/bids.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', '../../.env'],
    }),
    HealthModule,
    DatabaseModule,
    UsersModule,
    AuthModule,
    OrganisationsModule,
    InvitationsModule,
    VendorsModule,
    ProcurementModule,
    ApprovalWorkflowsModule,
    RFQsModule,
    BidsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
