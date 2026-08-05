import { Injectable } from '@nestjs/common';
import {
  ApprovalStatus,
  ComplianceStatus,
  ContractStatus,
  GoodsReceiptStatus,
  InvoiceStatus,
  Prisma,
  ProcurementStatus,
  PurchaseOrderStatus,
  VendorStatus,
  WorkflowStatus,
} from '@prisma/client';

import { PrismaService } from '../database/prisma.service';

export type ResolvedAnalyticsFilter = {
  organisationId: string;
  departments?: string[];
  startDate?: Date;
  endDate?: Date;
  vendorId?: string;
  department?: string;
  category?: string;
  currency?: string;
  status?: string;
  requesterId?: string;
  approverId?: string;
  search?: string;
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder: 'asc' | 'desc';
};

@Injectable()
export class AnalyticsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async getAllowedDepartments(
    userId: string,
    organisationId: string,
  ): Promise<string[]> {
    const [fromRequests, fromApprovals] = await Promise.all([
      this.prisma.procurementRequest.findMany({
        where: { organisationId, requesterId: userId },
        select: { department: true },
        distinct: ['department'],
      }),
      this.prisma.approvalStep.findMany({
        where: {
          approverId: userId,
          workflow: { procurementRequest: { organisationId } },
        },
        select: {
          workflow: {
            select: { procurementRequest: { select: { department: true } } },
          },
        },
      }),
    ]);

    const departments = new Set<string>();
    fromRequests.forEach((r) => departments.add(r.department));
    fromApprovals.forEach((a) =>
      departments.add(a.workflow.procurementRequest.department),
    );
    return Array.from(departments);
  }

  countProcurementRequests(filter: ResolvedAnalyticsFilter) {
    return this.prisma.procurementRequest.count({
      where: this.procurementWhere(filter),
    });
  }

  countProcurementByStatus(
    filter: ResolvedAnalyticsFilter,
    status: ProcurementStatus,
  ) {
    return this.prisma.procurementRequest.count({
      where: { ...this.procurementWhere(filter), status },
    });
  }

  findProcurementRequests(filter: ResolvedAnalyticsFilter) {
    return this.prisma.procurementRequest.findMany({
      where: this.procurementWhere(filter),
      include: {
        items: true,
        approvalWorkflow: { include: { steps: true } },
        purchaseOrders: true,
        requester: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
      },
      orderBy: { createdAt: filter.sortOrder },
    });
  }

  countVendors(filter: ResolvedAnalyticsFilter, status?: VendorStatus) {
    return this.prisma.vendor.count({
      where: {
        organisationId: filter.organisationId,
        ...(status ? { status } : {}),
        ...(filter.category
          ? { category: { equals: filter.category, mode: 'insensitive' } }
          : {}),
        ...(filter.vendorId ? { id: filter.vendorId } : {}),
      },
    });
  }

  countVendorsByCompliance(
    filter: ResolvedAnalyticsFilter,
    compliance: ComplianceStatus,
  ) {
    return this.prisma.vendor.count({
      where: {
        organisationId: filter.organisationId,
        complianceStatus: compliance,
      },
    });
  }

  findVendors(filter: ResolvedAnalyticsFilter) {
    return this.prisma.vendor.findMany({
      where: {
        organisationId: filter.organisationId,
        ...(filter.category
          ? { category: { equals: filter.category, mode: 'insensitive' } }
          : {}),
        ...(filter.vendorId ? { id: filter.vendorId } : {}),
        ...(filter.search
          ? {
              OR: [
                { name: { contains: filter.search, mode: 'insensitive' } },
                { category: { contains: filter.search, mode: 'insensitive' } },
              ],
            }
          : {}),
      },
      include: {
        bids: { include: { evaluations: true } },
        purchaseOrders: true,
        invoices: true,
        contracts: true,
      },
    });
  }

  countPurchaseOrders(
    filter: ResolvedAnalyticsFilter,
    status?: PurchaseOrderStatus,
  ) {
    return this.prisma.purchaseOrder.count({
      where: this.poWhere(filter, status),
    });
  }

  findPurchaseOrders(filter: ResolvedAnalyticsFilter) {
    return this.prisma.purchaseOrder.findMany({
      where: this.poWhere(filter),
      include: {
        vendor: true,
        items: true,
        goodsReceipts: { include: { items: true } },
        procurementRequest: true,
      },
      orderBy: { createdAt: filter.sortOrder },
    });
  }

  countContracts(filter: ResolvedAnalyticsFilter, status?: ContractStatus) {
    return this.prisma.contract.count({
      where: this.contractWhere(filter, status),
    });
  }

  findContracts(filter: ResolvedAnalyticsFilter) {
    return this.prisma.contract.findMany({
      where: this.contractWhere(filter),
      include: { vendor: true, procurementRequest: true },
      orderBy: { createdAt: filter.sortOrder },
    });
  }

  countPendingApprovals(filter: ResolvedAnalyticsFilter) {
    return this.prisma.approvalStep.count({
      where: {
        status: ApprovalStatus.PENDING,
        workflow: {
          status: WorkflowStatus.IN_PROGRESS,
          procurementRequest: this.procurementWhere(filter),
        },
        ...(filter.approverId ? { approverId: filter.approverId } : {}),
      },
    });
  }

  findApprovalSteps(filter: ResolvedAnalyticsFilter) {
    return this.prisma.approvalStep.findMany({
      where: {
        workflow: {
          procurementRequest: this.procurementWhere(filter),
        },
        ...(filter.approverId ? { approverId: filter.approverId } : {}),
      },
      include: {
        approver: {
          select: { id: true, firstName: true, lastName: true, role: true },
        },
        workflow: {
          include: {
            procurementRequest: {
              select: { id: true, title: true, department: true },
            },
          },
        },
      },
    });
  }

  countInvoices(filter: ResolvedAnalyticsFilter, status?: InvoiceStatus) {
    return this.prisma.invoice.count({
      where: this.invoiceWhere(filter, status),
    });
  }

  findInvoices(filter: ResolvedAnalyticsFilter) {
    return this.prisma.invoice.findMany({
      where: this.invoiceWhere(filter),
      include: {
        vendor: true,
        items: true,
        purchaseOrder: true,
        goodsReceipt: true,
        matchingResult: true,
      },
      orderBy: { createdAt: filter.sortOrder },
    });
  }

  countGoodsReceipts(
    filter: ResolvedAnalyticsFilter,
    status?: GoodsReceiptStatus,
  ) {
    return this.prisma.goodsReceipt.count({
      where: this.grnWhere(filter, status),
    });
  }

  findGoodsReceipts(filter: ResolvedAnalyticsFilter) {
    return this.prisma.goodsReceipt.findMany({
      where: this.grnWhere(filter),
      include: {
        items: true,
        purchaseOrder: { include: { vendor: true, procurementRequest: true } },
      },
      orderBy: { createdAt: filter.sortOrder },
    });
  }

  findPaidInvoices(filter: ResolvedAnalyticsFilter) {
    return this.findInvoices({ ...filter, status: undefined }).then(
      (invoices) => invoices.filter((i) => i.status === InvoiceStatus.PAID),
    );
  }

  private procurementWhere(
    filter: ResolvedAnalyticsFilter,
  ): Prisma.ProcurementRequestWhereInput {
    const where: Prisma.ProcurementRequestWhereInput = {
      organisationId: filter.organisationId,
    };

    if (filter.departments?.length) {
      where.department = { in: filter.departments };
    } else if (filter.department) {
      where.department = filter.department;
    }

    if (filter.requesterId) where.requesterId = filter.requesterId;
    if (filter.currency) where.currency = filter.currency;
    if (filter.status) where.status = filter.status as ProcurementStatus;

    if (filter.startDate || filter.endDate) {
      where.createdAt = {};
      if (filter.startDate) where.createdAt.gte = filter.startDate;
      if (filter.endDate) where.createdAt.lte = filter.endDate;
    }

    if (filter.search) {
      where.OR = [
        { title: { contains: filter.search, mode: 'insensitive' } },
        { description: { contains: filter.search, mode: 'insensitive' } },
        { department: { contains: filter.search, mode: 'insensitive' } },
      ];
    }

    return where;
  }

  private poWhere(
    filter: ResolvedAnalyticsFilter,
    status?: PurchaseOrderStatus,
  ): Prisma.PurchaseOrderWhereInput {
    return {
      organisationId: filter.organisationId,
      ...(filter.vendorId ? { vendorId: filter.vendorId } : {}),
      ...(filter.currency ? { currency: filter.currency } : {}),
      ...(status
        ? { status }
        : filter.status
          ? { status: filter.status as PurchaseOrderStatus }
          : {}),
      procurementRequest: this.procurementWhere(filter),
      ...(filter.startDate || filter.endDate
        ? {
            createdAt: {
              ...(filter.startDate ? { gte: filter.startDate } : {}),
              ...(filter.endDate ? { lte: filter.endDate } : {}),
            },
          }
        : {}),
    };
  }

  private contractWhere(
    filter: ResolvedAnalyticsFilter,
    status?: ContractStatus,
  ): Prisma.ContractWhereInput {
    return {
      organisationId: filter.organisationId,
      ...(filter.vendorId ? { vendorId: filter.vendorId } : {}),
      ...(filter.currency ? { currency: filter.currency } : {}),
      ...(status
        ? { status }
        : filter.status
          ? { status: filter.status as ContractStatus }
          : {}),
      procurementRequest: this.procurementWhere(filter),
      ...(filter.startDate || filter.endDate
        ? {
            createdAt: {
              ...(filter.startDate ? { gte: filter.startDate } : {}),
              ...(filter.endDate ? { lte: filter.endDate } : {}),
            },
          }
        : {}),
    };
  }

  private invoiceWhere(
    filter: ResolvedAnalyticsFilter,
    status?: InvoiceStatus,
  ): Prisma.InvoiceWhereInput {
    return {
      organisationId: filter.organisationId,
      ...(filter.vendorId ? { vendorId: filter.vendorId } : {}),
      ...(filter.currency ? { currency: filter.currency } : {}),
      ...(status
        ? { status }
        : filter.status
          ? { status: filter.status as InvoiceStatus }
          : {}),
      ...(filter.startDate || filter.endDate
        ? {
            invoiceDate: {
              ...(filter.startDate ? { gte: filter.startDate } : {}),
              ...(filter.endDate ? { lte: filter.endDate } : {}),
            },
          }
        : {}),
      purchaseOrder: { procurementRequest: this.procurementWhere(filter) },
    };
  }

  private grnWhere(
    filter: ResolvedAnalyticsFilter,
    status?: GoodsReceiptStatus,
  ): Prisma.GoodsReceiptWhereInput {
    return {
      organisationId: filter.organisationId,
      ...(status
        ? { status }
        : filter.status
          ? { status: filter.status as GoodsReceiptStatus }
          : {}),
      ...(filter.startDate || filter.endDate
        ? {
            receiptDate: {
              ...(filter.startDate ? { gte: filter.startDate } : {}),
              ...(filter.endDate ? { lte: filter.endDate } : {}),
            },
          }
        : {}),
      purchaseOrder: {
        ...(filter.vendorId ? { vendorId: filter.vendorId } : {}),
        procurementRequest: this.procurementWhere(filter),
      },
    };
  }
}
