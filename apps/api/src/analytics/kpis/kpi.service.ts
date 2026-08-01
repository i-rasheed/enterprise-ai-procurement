import { Injectable } from '@nestjs/common';
import {
  ApprovalStatus,
  BidStatus,
  ComplianceStatus,
  ContractStatus,
  GoodsReceiptStatus,
  InvoiceStatus,
  ProcurementStatus,
  PurchaseOrderStatus,
  VendorStatus,
} from '@prisma/client';

import {
  AnalyticsRepository,
  ResolvedAnalyticsFilter,
} from '../analytics.repository';
import { average, daysBetween, toNumber } from '../utils/analytics.utils';

@Injectable()
export class KpiService {
  constructor(private readonly repository: AnalyticsRepository) {}

  async calculate(filter: ResolvedAnalyticsFilter) {
    const [
      procurementRequests,
      approvalSteps,
      vendors,
      purchaseOrders,
      invoices,
      goodsReceipts,
      contracts,
    ] = await Promise.all([
      this.repository.findProcurementRequests(filter),
      this.repository.findApprovalSteps(filter),
      this.repository.findVendors(filter),
      this.repository.findPurchaseOrders(filter),
      this.repository.findInvoices(filter),
      this.repository.findGoodsReceipts(filter),
      this.repository.findContracts(filter),
    ]);

    const approvalDurations = approvalSteps
      .filter((s) => s.actedAt && s.status !== ApprovalStatus.PENDING)
      .map((s) => daysBetween(s.createdAt, s.actedAt!));

    const procurementDurations = procurementRequests
      .filter(
        (pr) => pr.status === ProcurementStatus.APPROVED && pr.approvalWorkflow,
      )
      .map((pr) => {
        const steps = pr.approvalWorkflow!.steps.filter((s) => s.actedAt);
        if (steps.length === 0) return daysBetween(pr.createdAt, pr.updatedAt);
        const last = steps.sort(
          (a, b) => b.actedAt!.getTime() - a.actedAt!.getTime(),
        )[0];
        return daysBetween(pr.createdAt, last.actedAt!);
      });

    const invoiceProcessingTimes = invoices
      .filter(
        (i) =>
          i.status === InvoiceStatus.PAID ||
          i.status === InvoiceStatus.APPROVED,
      )
      .map((i) => daysBetween(i.createdAt, i.updatedAt));

    const poFulfillmentRates = purchaseOrders
      .filter(
        (po) =>
          po.status === PurchaseOrderStatus.COMPLETED ||
          po.status === PurchaseOrderStatus.PARTIALLY_DELIVERED,
      )
      .map((po) => {
        const ordered = po.items.reduce((s, item) => s + item.quantity, 0);
        const received = po.goodsReceipts
          .flatMap((gr) => gr.items)
          .reduce((s, item) => s + item.quantityReceived, 0);
        return ordered === 0 ? 0 : (received / ordered) * 100;
      });

    const vendorDeliveryScores = vendors.map((vendor) => {
      const pos = purchaseOrders.filter((po) => po.vendorId === vendor.id);
      const onTime = pos.filter(
        (po) =>
          po.status === PurchaseOrderStatus.COMPLETED &&
          po.goodsReceipts.some(
            (gr) =>
              gr.status === GoodsReceiptStatus.COMPLETED ||
              gr.status === GoodsReceiptStatus.RECEIVED,
          ),
      ).length;
      return pos.length === 0 ? 100 : (onTime / pos.length) * 100;
    });

    const vendorResponseTimes = vendors.map((vendor) => {
      const bids = vendor.bids.filter((b) => b.submittedAt);
      if (bids.length === 0) return 0;
      return average(bids.map((b) => daysBetween(b.createdAt, b.submittedAt!)));
    });

    const vendorSuccessRates = vendors.map((vendor) => {
      const submitted = vendor.bids.filter((b) => b.submittedAt).length;
      const awarded = vendor.bids.filter(
        (b) => b.status === BidStatus.AWARDED,
      ).length;
      return submitted === 0 ? 0 : (awarded / submitted) * 100;
    });

    const totalBudget = procurementRequests.reduce(
      (s, pr) => s + toNumber(pr.estimatedBudget),
      0,
    );
    const totalSpend = invoices
      .filter(
        (i) =>
          i.status === InvoiceStatus.PAID ||
          i.status === InvoiceStatus.APPROVED,
      )
      .reduce((s, i) => s + toNumber(i.totalAmount), 0);

    const savings = procurementRequests
      .filter((pr) => pr.status === ProcurementStatus.APPROVED)
      .reduce((s, pr) => {
        const budget = toNumber(pr.estimatedBudget);
        const actual = pr.purchaseOrders.reduce(
          (ps, po) => ps + toNumber(po.totalAmount),
          0,
        );
        return s + Math.max(budget - actual, 0);
      }, 0);

    const pendingApprovalsByLevel = approvalSteps
      .filter((s) => s.status === ApprovalStatus.PENDING)
      .reduce<Record<number, number>>((acc, step) => {
        acc[step.level] = (acc[step.level] ?? 0) + 1;
        return acc;
      }, {});

    const departmentPerformance = procurementRequests.reduce<
      Record<string, { total: number; approved: number; rejected: number }>
    >((acc, pr) => {
      if (!acc[pr.department]) {
        acc[pr.department] = { total: 0, approved: 0, rejected: 0 };
      }
      acc[pr.department].total += 1;
      if (pr.status === ProcurementStatus.APPROVED)
        acc[pr.department].approved += 1;
      if (pr.status === ProcurementStatus.REJECTED)
        acc[pr.department].rejected += 1;
      return acc;
    }, {});

    const verifiedVendors = vendors.filter(
      (v) => v.complianceStatus === ComplianceStatus.VERIFIED,
    ).length;

    const lateDeliveries = goodsReceipts.filter(
      (gr) =>
        gr.status === GoodsReceiptStatus.PARTIALLY_RECEIVED ||
        gr.status === GoodsReceiptStatus.REJECTED,
    ).length;

    const rejectedInvoices = invoices.filter(
      (i) => i.status === InvoiceStatus.REJECTED,
    ).length;

    const renewedContracts = contracts.filter(
      (c) => c.status === ContractStatus.RENEWED,
    ).length;
    const expiredContracts = contracts.filter(
      (c) => c.status === ContractStatus.EXPIRED,
    ).length;

    return {
      averageApprovalDurationDays: average(approvalDurations),
      averageProcurementDurationDays: average(procurementDurations),
      vendorDeliveryPerformance: average(vendorDeliveryScores),
      vendorResponseTimeDays: average(vendorResponseTimes),
      vendorSuccessRate: average(vendorSuccessRates),
      averageContractValue:
        contracts.length === 0
          ? 0
          : contracts.reduce((s, c) => s + toNumber(c.value), 0) /
            contracts.length,
      averageInvoiceProcessingTimeDays: average(invoiceProcessingTimes),
      averagePoFulfillmentRate: average(poFulfillmentRates),
      approvalBottlenecks: Object.entries(pendingApprovalsByLevel).map(
        ([level, count]) => ({ level: Number(level), pendingCount: count }),
      ),
      departmentPerformance: Object.entries(departmentPerformance).map(
        ([department, stats]) => ({
          department,
          ...stats,
          approvalRate:
            stats.total === 0 ? 0 : (stats.approved / stats.total) * 100,
        }),
      ),
      savingsPercentage: totalBudget === 0 ? 0 : (savings / totalBudget) * 100,
      budgetConsumption:
        totalBudget === 0 ? 0 : (totalSpend / totalBudget) * 100,
      compliancePercentage:
        vendors.length === 0 ? 0 : (verifiedVendors / vendors.length) * 100,
      lateDeliveries,
      rejectedInvoices,
      contractRenewalRate:
        expiredContracts + renewedContracts === 0
          ? 0
          : (renewedContracts / (expiredContracts + renewedContracts)) * 100,
      activeVendors: vendors.filter((v) => v.status === VendorStatus.ACTIVE)
        .length,
      totalSavings: savings,
      totalSpend,
      totalBudget,
    };
  }
}
