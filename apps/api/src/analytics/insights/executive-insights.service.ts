import { Injectable } from '@nestjs/common';

import { AiDataContextService } from '../../ai/ai-data-context.service';
import { AiService } from '../../ai/ai.service';
import { AI_FEATURES } from '../../ai/constants/ai.constants';
import { ResolvedAnalyticsFilter } from '../analytics.repository';
import { DashboardService } from '../dashboard/dashboard.service';
import { KpiService } from '../kpis/kpi.service';

const EXECUTIVE_INSIGHTS_SYSTEM_PROMPT = `You are an executive procurement advisor.
Analyze the provided dashboard metrics and organisational data.
Return JSON with:
- topRisks (array of { risk, severity, impact })
- spendAnomalies (array of { area, description, amount })
- savingsOpportunities (array of strings)
- vendorConcerns (array of { vendor, concern, recommendation })
- contractRisks (array of { contract, risk, action })
- approvalBottlenecks (array of { level, count, recommendation })
- executiveSummary (string, 2-3 paragraphs)`;

@Injectable()
export class ExecutiveInsightsService {
  constructor(
    private readonly aiService: AiService,
    private readonly dataContext: AiDataContextService,
    private readonly dashboardService: DashboardService,
    private readonly kpiService: KpiService,
  ) {}

  async generateInsights(filter: ResolvedAnalyticsFilter, userId: string) {
    const [dashboard, kpis, orgContext] = await Promise.all([
      this.dashboardService.getExecutiveDashboard(filter),
      this.kpiService.calculate(filter),
      this.dataContext.getOrganisationContext(filter.organisationId),
    ]);

    const context = JSON.stringify({ dashboard, kpis, orgContext }, null, 2);

    const result = await this.aiService.generate(
      {
        organisationId: filter.organisationId,
        userId,
        feature: AI_FEATURES.SPEND_ANALYSIS,
      },
      EXECUTIVE_INSIGHTS_SYSTEM_PROMPT,
      `Generate executive insights from:\n\n${context}`,
    );

    return {
      topRisks: result.topRisks ?? [],
      spendAnomalies: result.spendAnomalies ?? [],
      savingsOpportunities: result.savingsOpportunities ?? [],
      vendorConcerns: result.vendorConcerns ?? [],
      contractRisks: result.contractRisks ?? [],
      approvalBottlenecks: result.approvalBottlenecks ?? [],
      executiveSummary:
        typeof result.executiveSummary === 'string'
          ? result.executiveSummary
          : 'Executive summary unavailable.',
      provider: this.aiService.getProviderName(),
    };
  }
}
