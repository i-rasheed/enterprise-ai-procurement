import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import {
  ChartDatasetDto,
  ReportResponseDto,
} from '../dto/analytics-response.dto';
import { ResolvedAnalyticsFilter } from '../analytics.repository';
import {
  REPORT_TYPE_LABELS,
  REPORT_TYPES,
  ReportType,
} from '../constants/report-types.constants';
import { DomainAnalyticsService } from '../analytics/domain-analytics.service';
import { DashboardService } from '../dashboard/dashboard.service';
import { KpiService } from '../kpis/kpi.service';

@Injectable()
export class ReportsService {
  constructor(
    private readonly dashboardService: DashboardService,
    private readonly domainAnalytics: DomainAnalyticsService,
    private readonly kpiService: KpiService,
  ) {}

  listReports() {
    return REPORT_TYPES.map((id) => ({
      id,
      title: REPORT_TYPE_LABELS[id],
    }));
  }

  async generateReport(
    reportId: string,
    filter: ResolvedAnalyticsFilter,
  ): Promise<ReportResponseDto> {
    if (!REPORT_TYPES.includes(reportId as ReportType)) {
      throw new NotFoundException(`Report "${reportId}" not found`);
    }

    const type = reportId as ReportType;
    let data: Record<string, unknown>;
    let charts: ChartDatasetDto[] = [];
    let kpis: Record<string, unknown> = {};

    switch (type) {
      case 'procurement': {
        const result =
          await this.domainAnalytics.getProcurementAnalytics(filter);
        data = result.summary as Record<string, unknown>;
        charts = result.charts;
        kpis = result.kpis as Record<string, unknown>;
        break;
      }
      case 'vendor': {
        const result = await this.domainAnalytics.getVendorAnalytics(filter);
        data = result.summary as Record<string, unknown>;
        charts = result.charts;
        kpis = result.kpis as Record<string, unknown>;
        break;
      }
      case 'spend': {
        const result = await this.domainAnalytics.getSpendAnalytics(filter);
        data = result.summary as Record<string, unknown>;
        charts = result.charts;
        kpis = result.kpis as Record<string, unknown>;
        break;
      }
      case 'contract': {
        const result = await this.domainAnalytics.getContractAnalytics(filter);
        data = result.summary as Record<string, unknown>;
        charts = result.charts;
        kpis = result.kpis as Record<string, unknown>;
        break;
      }
      case 'invoice': {
        const result = await this.domainAnalytics.getInvoiceAnalytics(filter);
        data = result.summary as Record<string, unknown>;
        charts = result.charts;
        kpis = result.kpis as Record<string, unknown>;
        break;
      }
      case 'purchase-order': {
        const result = await this.domainAnalytics.getPoAnalytics(filter);
        data = result.summary as Record<string, unknown>;
        charts = result.charts;
        kpis = result.kpis as Record<string, unknown>;
        break;
      }
      case 'goods-receipt': {
        const result = await this.domainAnalytics.getGrnAnalytics(filter);
        data = result.summary as Record<string, unknown>;
        charts = result.charts;
        kpis = result.kpis as Record<string, unknown>;
        break;
      }
      case 'approval': {
        const result = await this.domainAnalytics.getApprovalAnalytics(filter);
        data = result.summary as Record<string, unknown>;
        charts = result.charts;
        kpis = result.kpis as Record<string, unknown>;
        break;
      }
      case 'budget': {
        const kpiResult = await this.kpiService.calculate(filter);
        data = {
          totalBudget: kpiResult.totalBudget,
          totalSpend: kpiResult.totalSpend,
          savingsGenerated: kpiResult.totalSavings,
          budgetUtilization: kpiResult.budgetConsumption,
        };
        kpis = {
          savingsPercentage: kpiResult.savingsPercentage,
          budgetConsumption: kpiResult.budgetConsumption,
        };
        break;
      }
      case 'executive-summary': {
        const dashboard =
          await this.dashboardService.getExecutiveDashboard(filter);
        data = {
          totalProcurementRequests: dashboard.totalProcurementRequests,
          totalSpend: dashboard.totalSpend,
          savingsGenerated: dashboard.savingsGenerated,
          activeVendors: dashboard.activeVendors,
          pendingApprovals: dashboard.pendingApprovals,
          budgetUtilization: dashboard.budgetUtilization,
        };
        charts = Object.values(dashboard.charts ?? {});
        kpis = dashboard.kpis as Record<string, unknown>;
        break;
      }
      default:
        throw new BadRequestException(`Unsupported report type: ${reportId}`);
    }

    return {
      id: type,
      title: REPORT_TYPE_LABELS[type],
      generatedAt: new Date().toISOString(),
      data,
      charts,
      kpis,
    };
  }
}
