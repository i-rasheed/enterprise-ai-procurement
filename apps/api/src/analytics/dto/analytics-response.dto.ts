import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ChartDatasetItemDto {
  @ApiProperty({ example: 'Total Spend' })
  label!: string;

  @ApiProperty({ example: [120000, 95000, 88000] })
  data!: number[];
}

export class ChartDatasetDto {
  @ApiProperty({
    enum: ['bar', 'line', 'pie', 'area', 'stacked-bar', 'time-series'],
    example: 'bar',
  })
  type!: string;

  @ApiProperty({ example: 'Monthly Spend Trend' })
  title!: string;

  @ApiProperty({ example: ['2026-01', '2026-02', '2026-03'] })
  labels!: string[];

  @ApiProperty({ type: [ChartDatasetItemDto] })
  datasets!: ChartDatasetItemDto[];
}

export class TopItemDto {
  @ApiProperty({ example: 'IT Hardware' })
  name!: string;

  @ApiProperty({ example: 250000 })
  value!: number;
}

export class ExecutiveDashboardResponseDto {
  @ApiProperty({ example: 48 })
  totalProcurementRequests!: number;

  @ApiProperty({ example: 12 })
  openProcurementRequests!: number;

  @ApiProperty({ example: 30 })
  completedProcurementRequests!: number;

  @ApiProperty({ example: 25 })
  activeVendors!: number;

  @ApiProperty({ example: 18 })
  approvedVendors!: number;

  @ApiProperty({ example: 35 })
  totalPurchaseOrders!: number;

  @ApiProperty({ example: 8 })
  outstandingPurchaseOrders!: number;

  @ApiProperty({ example: 10 })
  totalContracts!: number;

  @ApiProperty({ example: 6 })
  activeContracts!: number;

  @ApiProperty({ example: 5 })
  pendingApprovals!: number;

  @ApiProperty({ example: 4 })
  invoicesAwaitingApproval!: number;

  @ApiProperty({ example: 22 })
  invoicesPaid!: number;

  @ApiProperty({ example: 3 })
  goodsReceiptsPending!: number;

  @ApiProperty({ example: 1250000 })
  totalSpend!: number;

  @ApiProperty({ example: 85000 })
  savingsGenerated!: number;

  @ApiProperty({ example: 14.5 })
  averageProcurementCycleTimeDays!: number;

  @ApiProperty({ example: 3.2 })
  averageApprovalTimeDays!: number;

  @ApiProperty({ type: [TopItemDto] })
  topCategories!: TopItemDto[];

  @ApiProperty({ type: [TopItemDto] })
  topVendors!: TopItemDto[];

  @ApiProperty({ type: [TopItemDto] })
  topDepartments!: TopItemDto[];

  @ApiProperty({ type: ChartDatasetDto })
  spendByCategory!: ChartDatasetDto;

  @ApiProperty({ type: ChartDatasetDto })
  spendByVendor!: ChartDatasetDto;

  @ApiProperty({ type: ChartDatasetDto })
  spendByDepartment!: ChartDatasetDto;

  @ApiProperty({ example: 72.5 })
  budgetUtilization!: number;

  @ApiProperty({ type: ChartDatasetDto })
  monthlyProcurementTrend!: ChartDatasetDto;

  @ApiProperty({ type: ChartDatasetDto })
  monthlySpendTrend!: ChartDatasetDto;

  @ApiProperty({ type: ChartDatasetDto })
  monthlySavingsTrend!: ChartDatasetDto;

  @ApiPropertyOptional()
  kpis?: Record<string, unknown>;

  @ApiPropertyOptional()
  charts?: Record<string, ChartDatasetDto>;
}

export class AnalyticsSummaryResponseDto {
  @ApiProperty()
  summary!: Record<string, unknown>;

  @ApiProperty({ type: [ChartDatasetDto] })
  charts!: ChartDatasetDto[];

  @ApiProperty()
  kpis!: Record<string, unknown>;

  @ApiProperty()
  pagination!: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export class ReportResponseDto {
  @ApiProperty({ example: 'procurement' })
  id!: string;

  @ApiProperty({ example: 'Procurement Report' })
  title!: string;

  @ApiProperty()
  generatedAt!: string;

  @ApiProperty()
  data!: Record<string, unknown>;

  @ApiProperty({ type: [ChartDatasetDto] })
  charts!: ChartDatasetDto[];

  @ApiProperty()
  kpis!: Record<string, unknown>;
}

export class ReportListItemDto {
  @ApiProperty({ example: 'procurement' })
  id!: string;

  @ApiProperty({ example: 'Procurement Report' })
  title!: string;
}

export class ExecutiveInsightsResponseDto {
  @ApiProperty()
  topRisks!: unknown[];

  @ApiProperty()
  spendAnomalies!: unknown[];

  @ApiProperty()
  savingsOpportunities!: unknown[];

  @ApiProperty()
  vendorConcerns!: unknown[];

  @ApiProperty()
  contractRisks!: unknown[];

  @ApiProperty()
  approvalBottlenecks!: unknown[];

  @ApiProperty()
  executiveSummary!: string;

  @ApiProperty({ example: 'openai' })
  provider!: string;
}
