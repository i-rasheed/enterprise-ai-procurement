import { Module } from '@nestjs/common';

import { AiModule } from '../ai/ai.module';
import { AuthModule } from '../auth/auth.module';
import { DatabaseModule } from '../database/database.module';
import { AnalyticsController } from './analytics/analytics.controller';
import { DomainAnalyticsService } from './analytics/domain-analytics.service';
import { AnalyticsRepository } from './analytics.repository';
import { DashboardController } from './dashboard/dashboard.controller';
import { DashboardService } from './dashboard/dashboard.service';
import { ExportService } from './exports/export.service';
import { ExecutiveInsightsService } from './insights/executive-insights.service';
import { ChartService } from './charts/chart.service';
import { KpiService } from './kpis/kpi.service';
import { ReportsController } from './reports/reports.controller';
import { ReportsService } from './reports/reports.service';
import { AnalyticsScopeService } from './scope/analytics-scope.service';

@Module({
  imports: [DatabaseModule, AuthModule, AiModule],
  controllers: [DashboardController, AnalyticsController, ReportsController],
  providers: [
    AnalyticsRepository,
    AnalyticsScopeService,
    DashboardService,
    DomainAnalyticsService,
    KpiService,
    ChartService,
    ReportsService,
    ExportService,
    ExecutiveInsightsService,
  ],
  exports: [
    AnalyticsRepository,
    DashboardService,
    DomainAnalyticsService,
    KpiService,
  ],
})
export class AnalyticsModule {}
