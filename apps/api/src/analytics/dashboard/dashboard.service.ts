import { Injectable } from '@nestjs/common';
import {
  ContractStatus,
  GoodsReceiptStatus,
  InvoiceStatus,
  ComplianceStatus,
  ProcurementStatus,
  PurchaseOrderStatus,
  VendorStatus,
} from '@prisma/client';

import {
  AnalyticsRepository,
  ResolvedAnalyticsFilter,
} from '../analytics.repository';
import { ChartService } from '../charts/chart.service';
import { KpiService } from '../kpis/kpi.service';
import { toNumber, topN } from '../utils/analytics.utils';

@Injectable()
export class DashboardService {
  constructor(
    private readonly repository: AnalyticsRepository,
    private readonly kpiService: KpiService,
    private readonly chartService: ChartService,
  ) {}

  async getExecutiveDashboard(filter: ResolvedAnalyticsFilter) {
    const [
      totalProcurementRequests,
      openProcurementRequests,
      completedProcurementRequests,
      activeVendors,
      approvedVendors,
      totalPurchaseOrders,
      outstandingIssued,
      outstandingAcknowledged,
      outstandingPartial,
      totalContracts,
      activeContracts,
      pendingApprovals,
      invoicesSubmitted,
      invoicesMatched,
      invoicesPaid,
      grnDraft,
      grnPartial,
      procurementRequests,
      invoices,
      purchaseOrders,
      kpis,
    ] = await Promise.all([
      this.repository.countProcurementRequests(filter),
      this.repository.countProcurementByStatus(
        filter,
        ProcurementStatus.SUBMITTED,
      ),
      this.repository.countProcurementByStatus(
        filter,
        ProcurementStatus.APPROVED,
      ),
      this.repository.countVendors(filter, VendorStatus.ACTIVE),
      this.repository.countVendorsByCompliance(
        filter,
        ComplianceStatus.VERIFIED,
      ),
      this.repository.countPurchaseOrders(filter),
      this.repository.countPurchaseOrders(filter, PurchaseOrderStatus.ISSUED),
      this.repository.countPurchaseOrders(
        filter,
        PurchaseOrderStatus.ACKNOWLEDGED,
      ),
      this.repository.countPurchaseOrders(
        filter,
        PurchaseOrderStatus.PARTIALLY_DELIVERED,
      ),
      this.repository.countContracts(filter),
      this.repository.countContracts(filter, ContractStatus.ACTIVE),
      this.repository.countPendingApprovals(filter),
      this.repository.countInvoices(filter, InvoiceStatus.SUBMITTED),
      this.repository.countInvoices(filter, InvoiceStatus.MATCHED),
      this.repository.countInvoices(filter, InvoiceStatus.PAID),
      this.repository.countGoodsReceipts(filter, GoodsReceiptStatus.DRAFT),
      this.repository.countGoodsReceipts(
        filter,
        GoodsReceiptStatus.PARTIALLY_RECEIVED,
      ),
      this.repository.findProcurementRequests(filter),
      this.repository.findInvoices(filter),
      this.repository.findPurchaseOrders(filter),
      this.kpiService.calculate(filter),
    ]);

    const outstandingPurchaseOrders =
      outstandingIssued + outstandingAcknowledged + outstandingPartial;
    const invoicesAwaitingApproval = invoicesSubmitted + invoicesMatched;
    const goodsReceiptsPending = grnDraft + grnPartial;

    const paidInvoices = invoices.filter(
      (i) => i.status === InvoiceStatus.PAID,
    );
    const spendInvoices = invoices.filter(
      (i) =>
        i.status === InvoiceStatus.PAID || i.status === InvoiceStatus.APPROVED,
    );

    const topCategories = topN(
      spendInvoices,
      (i) => i.vendor.category ?? 'Uncategorized',
      (i) => toNumber(i.totalAmount),
    );
    const topVendors = topN(
      spendInvoices,
      (i) => i.vendor.name,
      (i) => toNumber(i.totalAmount),
    );
    const topDepartments = topN(
      procurementRequests,
      (pr) => pr.department,
      (pr) => toNumber(pr.estimatedBudget),
    );

    const spendByCategory =
      this.chartService.buildSpendByCategory(spendInvoices);
    const spendByVendor = this.chartService.barChart(
      'Spend by Vendor',
      topVendors.map((v) => ({ label: v.name, value: v.value })),
    );
    const spendByDepartment = this.chartService.barChart(
      'Spend by Department',
      topDepartments.map((d) => ({ label: d.name, value: d.value })),
    );

    const monthlyProcurementTrend = this.chartService.buildMonthlyTrend(
      procurementRequests,
      (pr) => pr.createdAt,
      () => 1,
      'Monthly Procurement Requests',
    );
    const monthlySpendTrend = this.chartService.buildMonthlyTrend(
      paidInvoices,
      (i) => i.invoiceDate,
      (i) => toNumber(i.totalAmount),
      'Monthly Spend Trend',
    );

    const savingsByMonth = procurementRequests
      .filter((pr) => pr.status === ProcurementStatus.APPROVED)
      .map((pr) => {
        const budget = toNumber(pr.estimatedBudget);
        const actual = purchaseOrders
          .filter((po) => po.procurementRequestId === pr.id)
          .reduce((s, po) => s + toNumber(po.totalAmount), 0);
        return { pr, savings: Math.max(budget - actual, 0) };
      });
    const monthlySavingsTrend = this.chartService.buildMonthlyTrend(
      savingsByMonth,
      (item) => item.pr.createdAt,
      (item) => item.savings,
      'Monthly Savings Trend',
    );

    return {
      totalProcurementRequests,
      openProcurementRequests,
      completedProcurementRequests,
      activeVendors,
      approvedVendors,
      totalPurchaseOrders,
      outstandingPurchaseOrders,
      totalContracts,
      activeContracts,
      pendingApprovals,
      invoicesAwaitingApproval,
      invoicesPaid,
      goodsReceiptsPending,
      totalSpend: kpis.totalSpend,
      savingsGenerated: kpis.totalSavings,
      averageProcurementCycleTimeDays: kpis.averageProcurementDurationDays,
      averageApprovalTimeDays: kpis.averageApprovalDurationDays,
      topCategories,
      topVendors,
      topDepartments,
      spendByCategory,
      spendByVendor,
      spendByDepartment,
      budgetUtilization: kpis.budgetConsumption,
      monthlyProcurementTrend,
      monthlySpendTrend,
      monthlySavingsTrend,
      kpis,
      charts: {
        spendByCategory,
        spendByVendor,
        spendByDepartment,
        monthlyProcurementTrend,
        monthlySpendTrend,
        monthlySavingsTrend,
      },
    };
  }
}
