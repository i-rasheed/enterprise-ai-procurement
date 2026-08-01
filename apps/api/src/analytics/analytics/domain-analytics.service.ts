import { Injectable } from '@nestjs/common';
import {
  BidStatus,
  ContractStatus,
  InvoiceStatus,
  ProcurementStatus,
  PurchaseOrderStatus,
} from '@prisma/client';

import {
  AnalyticsRepository,
  ResolvedAnalyticsFilter,
} from '../analytics.repository';
import { ChartService } from '../charts/chart.service';
import { KpiService } from '../kpis/kpi.service';
import { toNumber, topN } from '../utils/analytics.utils';

@Injectable()
export class DomainAnalyticsService {
  constructor(
    private readonly repository: AnalyticsRepository,
    private readonly kpiService: KpiService,
    private readonly chartService: ChartService,
  ) {}

  async getSpendAnalytics(filter: ResolvedAnalyticsFilter) {
    const invoices = await this.repository.findInvoices(filter);
    const spendInvoices = invoices.filter(
      (i) =>
        i.status === InvoiceStatus.PAID || i.status === InvoiceStatus.APPROVED,
    );
    const totalSpend = spendInvoices.reduce(
      (s, i) => s + toNumber(i.totalAmount),
      0,
    );
    const kpis = await this.kpiService.calculate(filter);

    return {
      summary: {
        totalSpend,
        invoiceCount: spendInvoices.length,
        averageInvoiceValue: spendInvoices.length
          ? totalSpend / spendInvoices.length
          : 0,
        savingsGenerated: kpis.totalSavings,
        budgetUtilization: kpis.budgetConsumption,
      },
      charts: [
        this.chartService.buildSpendByCategory(spendInvoices),
        this.chartService.buildMonthlyTrend(
          spendInvoices,
          (i) => i.invoiceDate,
          (i) => toNumber(i.totalAmount),
          'Monthly Spend',
        ),
        this.chartService.barChart(
          'Top Vendors by Spend',
          topN(
            spendInvoices,
            (i) => i.vendor.name,
            (i) => toNumber(i.totalAmount),
          ).map((v) => ({ label: v.name, value: v.value })),
        ),
      ],
      kpis: {
        savingsPercentage: kpis.savingsPercentage,
        budgetConsumption: kpis.budgetConsumption,
      },
      pagination: this.paginate(spendInvoices.length, filter),
    };
  }

  async getVendorAnalytics(filter: ResolvedAnalyticsFilter) {
    const vendors = await this.repository.findVendors(filter);
    const kpis = await this.kpiService.calculate(filter);

    return {
      summary: {
        totalVendors: vendors.length,
        activeVendors: kpis.activeVendors,
        compliancePercentage: kpis.compliancePercentage,
        averageDeliveryPerformance: kpis.vendorDeliveryPerformance,
      },
      charts: [
        this.chartService.pieChart(
          'Vendors by Category',
          topN(
            vendors,
            (v) => v.category ?? 'Uncategorized',
            () => 1,
          ).map((c) => ({
            label: c.name,
            value: c.value,
          })),
        ),
        this.chartService.barChart(
          'Vendor Success Rate',
          vendors.slice(0, 10).map((v) => ({
            label: v.name,
            value:
              v.bids.filter((b) => b.submittedAt).length === 0
                ? 0
                : (v.bids.filter((b) => b.status === BidStatus.AWARDED).length /
                    v.bids.filter((b) => b.submittedAt).length) *
                  100,
          })),
        ),
      ],
      kpis: {
        vendorResponseTimeDays: kpis.vendorResponseTimeDays,
        vendorSuccessRate: kpis.vendorSuccessRate,
        vendorDeliveryPerformance: kpis.vendorDeliveryPerformance,
      },
      pagination: this.paginate(vendors.length, filter),
    };
  }

  async getContractAnalytics(filter: ResolvedAnalyticsFilter) {
    const contracts = await this.repository.findContracts(filter);
    const active = contracts.filter(
      (c) => c.status === ContractStatus.ACTIVE,
    ).length;

    return {
      summary: {
        totalContracts: contracts.length,
        activeContracts: active,
        totalValue: contracts.reduce((s, c) => s + toNumber(c.value), 0),
        averageValue:
          contracts.length === 0
            ? 0
            : contracts.reduce((s, c) => s + toNumber(c.value), 0) /
              contracts.length,
      },
      charts: [
        this.chartService.pieChart(
          'Contracts by Type',
          topN(
            contracts,
            (c) => c.contractType,
            () => 1,
          ).map((t) => ({
            label: t.name,
            value: t.value,
          })),
        ),
        this.chartService.buildMonthlyTrend(
          contracts,
          (c) => c.createdAt,
          (c) => toNumber(c.value),
          'Contract Value Trend',
        ),
      ],
      kpis: {
        averageContractValue: contracts.length
          ? contracts.reduce((s, c) => s + toNumber(c.value), 0) /
            contracts.length
          : 0,
        contractRenewalRate: (await this.kpiService.calculate(filter))
          .contractRenewalRate,
      },
      pagination: this.paginate(contracts.length, filter),
    };
  }

  async getProcurementAnalytics(filter: ResolvedAnalyticsFilter) {
    const requests = await this.repository.findProcurementRequests(filter);
    const kpis = await this.kpiService.calculate(filter);

    return {
      summary: {
        total: requests.length,
        draft: requests.filter((r) => r.status === ProcurementStatus.DRAFT)
          .length,
        submitted: requests.filter(
          (r) => r.status === ProcurementStatus.SUBMITTED,
        ).length,
        approved: requests.filter(
          (r) => r.status === ProcurementStatus.APPROVED,
        ).length,
        rejected: requests.filter(
          (r) => r.status === ProcurementStatus.REJECTED,
        ).length,
        totalBudget: requests.reduce(
          (s, r) => s + toNumber(r.estimatedBudget),
          0,
        ),
      },
      charts: [
        this.chartService.pieChart(
          'Requests by Status',
          Object.values(ProcurementStatus).map((status) => ({
            label: status,
            value: requests.filter((r) => r.status === status).length,
          })),
        ),
        this.chartService.barChart(
          'Requests by Department',
          topN(
            requests,
            (r) => r.department,
            () => 1,
          ).map((d) => ({
            label: d.name,
            value: d.value,
          })),
        ),
        this.chartService.buildMonthlyTrend(
          requests,
          (r) => r.createdAt,
          () => 1,
          'Procurement Trend',
        ),
      ],
      kpis: {
        averageProcurementDurationDays: kpis.averageProcurementDurationDays,
        departmentPerformance: kpis.departmentPerformance,
      },
      pagination: this.paginate(requests.length, filter),
    };
  }

  async getFinanceAnalytics(filter: ResolvedAnalyticsFilter) {
    const [invoices, kpis] = await Promise.all([
      this.repository.findInvoices(filter),
      this.kpiService.calculate(filter),
    ]);

    return {
      summary: {
        totalInvoices: invoices.length,
        paid: invoices.filter((i) => i.status === InvoiceStatus.PAID).length,
        pending: invoices.filter(
          (i) =>
            i.status === InvoiceStatus.SUBMITTED ||
            i.status === InvoiceStatus.MATCHED,
        ).length,
        rejected: invoices.filter((i) => i.status === InvoiceStatus.REJECTED)
          .length,
        totalSpend: kpis.totalSpend,
        totalBudget: kpis.totalBudget,
      },
      charts: [
        this.chartService.pieChart(
          'Invoices by Status',
          Object.values(InvoiceStatus).map((status) => ({
            label: status,
            value: invoices.filter((i) => i.status === status).length,
          })),
        ),
        this.chartService.buildMonthlyTrend(
          invoices.filter((i) => i.status === InvoiceStatus.PAID),
          (i) => i.invoiceDate,
          (i) => toNumber(i.totalAmount),
          'Paid Invoice Trend',
        ),
      ],
      kpis: {
        averageInvoiceProcessingTimeDays: kpis.averageInvoiceProcessingTimeDays,
        rejectedInvoices: kpis.rejectedInvoices,
        budgetConsumption: kpis.budgetConsumption,
      },
      pagination: this.paginate(invoices.length, filter),
    };
  }

  async getApprovalAnalytics(filter: ResolvedAnalyticsFilter) {
    const steps = await this.repository.findApprovalSteps(filter);
    const kpis = await this.kpiService.calculate(filter);

    return {
      summary: {
        totalSteps: steps.length,
        pending: steps.filter((s) => s.status === 'PENDING').length,
        approved: steps.filter((s) => s.status === 'APPROVED').length,
        rejected: steps.filter((s) => s.status === 'REJECTED').length,
      },
      charts: [
        this.chartService.barChart(
          'Pending Approvals by Level',
          kpis.approvalBottlenecks.map((b) => ({
            label: `Level ${b.level}`,
            value: b.pendingCount,
          })),
        ),
      ],
      kpis: {
        averageApprovalDurationDays: kpis.averageApprovalDurationDays,
        approvalBottlenecks: kpis.approvalBottlenecks,
      },
      pagination: this.paginate(steps.length, filter),
    };
  }

  async getInvoiceAnalytics(filter: ResolvedAnalyticsFilter) {
    return this.getFinanceAnalytics(filter);
  }

  async getPoAnalytics(filter: ResolvedAnalyticsFilter) {
    const pos = await this.repository.findPurchaseOrders(filter);
    const kpis = await this.kpiService.calculate(filter);

    return {
      summary: {
        total: pos.length,
        draft: pos.filter((p) => p.status === PurchaseOrderStatus.DRAFT).length,
        issued: pos.filter((p) => p.status === PurchaseOrderStatus.ISSUED)
          .length,
        completed: pos.filter((p) => p.status === PurchaseOrderStatus.COMPLETED)
          .length,
        totalValue: pos.reduce((s, p) => s + toNumber(p.totalAmount), 0),
      },
      charts: [
        this.chartService.pieChart(
          'PO by Status',
          Object.values(PurchaseOrderStatus).map((status) => ({
            label: status,
            value: pos.filter((p) => p.status === status).length,
          })),
        ),
        this.chartService.buildMonthlyTrend(
          pos,
          (p) => p.createdAt,
          (p) => toNumber(p.totalAmount),
          'PO Value Trend',
        ),
      ],
      kpis: {
        averagePoFulfillmentRate: kpis.averagePoFulfillmentRate,
        lateDeliveries: kpis.lateDeliveries,
      },
      pagination: this.paginate(pos.length, filter),
    };
  }

  async getGrnAnalytics(filter: ResolvedAnalyticsFilter) {
    const grns = await this.repository.findGoodsReceipts(filter);
    const kpis = await this.kpiService.calculate(filter);

    return {
      summary: {
        total: grns.length,
        pending: grns.filter(
          (g) => g.status === 'DRAFT' || g.status === 'PARTIALLY_RECEIVED',
        ).length,
        completed: grns.filter(
          (g) => g.status === 'COMPLETED' || g.status === 'RECEIVED',
        ).length,
        rejected: grns.filter((g) => g.status === 'REJECTED').length,
      },
      charts: [
        this.chartService.buildMonthlyTrend(
          grns,
          (g) => g.receiptDate,
          () => 1,
          'GRN Volume',
        ),
      ],
      kpis: { lateDeliveries: kpis.lateDeliveries },
      pagination: this.paginate(grns.length, filter),
    };
  }

  async getRiskAnalytics(filter: ResolvedAnalyticsFilter) {
    const kpis = await this.kpiService.calculate(filter);
    const vendors = await this.repository.findVendors(filter);

    return {
      summary: {
        compliancePercentage: kpis.compliancePercentage,
        lateDeliveries: kpis.lateDeliveries,
        rejectedInvoices: kpis.rejectedInvoices,
        highRiskVendors: vendors.filter(
          (v) => v.rating !== null && v.rating < 3,
        ).length,
      },
      charts: [
        this.chartService.barChart(
          'Vendor Compliance',
          vendors.slice(0, 10).map((v) => ({
            label: v.name,
            value:
              v.complianceStatus === 'VERIFIED'
                ? 100
                : v.complianceStatus === 'PENDING'
                  ? 50
                  : 0,
          })),
        ),
      ],
      kpis: {
        vendorDeliveryPerformance: kpis.vendorDeliveryPerformance,
        contractRenewalRate: kpis.contractRenewalRate,
        approvalBottlenecks: kpis.approvalBottlenecks,
      },
      pagination: this.paginate(vendors.length, filter),
    };
  }

  private paginate(total: number, filter: ResolvedAnalyticsFilter) {
    return {
      page: filter.page,
      limit: filter.limit,
      total,
      totalPages: Math.ceil(total / filter.limit) || 1,
    };
  }
}
