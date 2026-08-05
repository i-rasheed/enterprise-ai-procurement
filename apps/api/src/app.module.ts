import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard } from '@nestjs/throttler';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AnalyticsModule } from './analytics/analytics.module';
import { AiModule } from './ai/ai.module';
import { ApprovalWorkflowsModule } from './approval-workflows/approval-workflows.module';
import { AuditModule } from './audit/audit.module';
import { AuthModule } from './auth/auth.module';
import { BidEvaluationsModule } from './bid-evaluations/bid-evaluations.module';
import { BidsModule } from './bids/bids.module';
import { BillingModule } from './billing/billing.module';
import { CacheModule } from './cache/cache.module';
import { CorrelationIdMiddleware } from './common/middleware/correlation-id.middleware';
import { ContractsModule } from './contracts/contracts.module';
import { ContentModule } from './content/content.module';
import { CoreModule } from './core/core.module';
import { DatabaseModule } from './database/database.module';
import { EmailModule } from './email/email.module';
import { FeatureFlagsModule } from './feature-flags/feature-flags.module';
import { GoodsReceiptsModule } from './goods-receipts/goods-receipts.module';
import { HealthModule } from './health/health.module';
import { InvitationsModule } from './invitations/invitations.module';
import { InvoicesModule } from './invoices/invoices.module';
import { JobsModule } from './jobs/jobs.module';
import { NotificationsModule } from './notifications/notifications.module';
import { OnboardingModule } from './onboarding/onboarding.module';
import { OrganisationsModule } from './organisations/organisations.module';
import { PlatformModule } from './platform/platform.module';
import { ProcurementModule } from './procurement/procurement.module';
import { PurchaseOrdersModule } from './purchase-orders/purchase-orders.module';
import { RFQsModule } from './rfqs/rfqs.module';
import { StorageModule } from './storage/storage.module';
import { SupportModule } from './support/support.module';
import { UsersModule } from './users/users.module';
import { VendorsModule } from './vendors/vendors.module';

@Module({
  imports: [
    CoreModule,
    AuditModule,
    CacheModule,
    JobsModule,
    StorageModule,
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
    BidEvaluationsModule,
    PurchaseOrdersModule,
    GoodsReceiptsModule,
    InvoicesModule,
    ContractsModule,
    BillingModule,
    FeatureFlagsModule,
    EmailModule,
    OnboardingModule,
    SupportModule,
    PlatformModule,
    ContentModule,
    AiModule,
    AnalyticsModule,
    NotificationsModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(CorrelationIdMiddleware).forRoutes('*');
  }
}
