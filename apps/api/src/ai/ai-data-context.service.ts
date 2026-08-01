import { Injectable, NotFoundException } from '@nestjs/common';

import { PrismaService } from '../database/prisma.service';

@Injectable()
export class AiDataContextService {
  constructor(private readonly prisma: PrismaService) {}

  async getContractContext(
    contractId: string,
    organisationId: string,
  ): Promise<string> {
    const contract = await this.prisma.contract.findFirst({
      where: { id: contractId, organisationId },
      include: {
        vendor: true,
        documents: true,
        versions: { orderBy: { version: 'desc' }, take: 5 },
        procurementRequest: { include: { items: true } },
        purchaseOrder: { include: { items: true } },
      },
    });

    if (!contract) {
      throw new NotFoundException(`Contract ${contractId} not found`);
    }

    return JSON.stringify(
      {
        contractNumber: contract.contractNumber,
        title: contract.title,
        description: contract.description,
        status: contract.status,
        contractType: contract.contractType,
        startDate: contract.startDate,
        endDate: contract.endDate,
        value: contract.value,
        currency: contract.currency,
        renewalType: contract.renewalType,
        renewalDate: contract.renewalDate,
        autoRenew: contract.autoRenew,
        signedByOrganisation: contract.signedByOrganisation,
        signedByVendor: contract.signedByVendor,
        vendor: contract.vendor,
        documents: contract.documents.map((d) => ({
          fileName: d.fileName,
          mimeType: d.mimeType,
        })),
        recentVersions: contract.versions,
        linkedProcurement: contract.procurementRequest,
        linkedPurchaseOrder: contract.purchaseOrder,
      },
      null,
      2,
    );
  }

  async getVendorContext(
    vendorId: string,
    organisationId: string,
  ): Promise<string> {
    const vendor = await this.prisma.vendor.findFirst({
      where: { id: vendorId, organisationId },
      include: {
        bids: {
          include: { evaluations: true, rfq: true },
          take: 10,
          orderBy: { createdAt: 'desc' },
        },
        purchaseOrders: { take: 10, orderBy: { createdAt: 'desc' } },
        invoices: { take: 10, orderBy: { createdAt: 'desc' } },
        contracts: { take: 5, orderBy: { createdAt: 'desc' } },
      },
    });

    if (!vendor) {
      throw new NotFoundException(`Vendor ${vendorId} not found`);
    }

    return JSON.stringify(vendor, null, 2);
  }

  async getProcurementContext(
    procurementId: string,
    organisationId: string,
  ): Promise<string> {
    const request = await this.prisma.procurementRequest.findFirst({
      where: { id: procurementId, organisationId },
      include: {
        items: true,
        rfqs: { include: { bids: { include: { vendor: true, items: true } } } },
        awards: { include: { bid: { include: { vendor: true } } } },
        purchaseOrders: { include: { vendor: true, items: true } },
        approvalWorkflow: { include: { steps: true } },
      },
    });

    if (!request) {
      throw new NotFoundException(
        `Procurement request ${procurementId} not found`,
      );
    }

    return JSON.stringify(request, null, 2);
  }

  async getInvoiceContext(
    invoiceId: string,
    organisationId: string,
  ): Promise<string> {
    const invoice = await this.prisma.invoice.findFirst({
      where: { id: invoiceId, organisationId },
      include: {
        vendor: true,
        items: { include: { purchaseOrderItem: true } },
        purchaseOrder: { include: { items: true } },
        goodsReceipt: { include: { items: true } },
        matchingResult: true,
      },
    });

    if (!invoice) {
      throw new NotFoundException(`Invoice ${invoiceId} not found`);
    }

    const duplicateCandidates = await this.prisma.invoice.findMany({
      where: {
        organisationId,
        id: { not: invoiceId },
        OR: [
          { invoiceNumber: invoice.invoiceNumber },
          {
            vendorId: invoice.vendorId,
            totalAmount: invoice.totalAmount,
            invoiceDate: invoice.invoiceDate,
          },
        ],
      },
      select: {
        id: true,
        invoiceNumber: true,
        totalAmount: true,
        status: true,
        invoiceDate: true,
      },
    });

    return JSON.stringify({ invoice, duplicateCandidates }, null, 2);
  }

  async getSpendContext(organisationId: string): Promise<string> {
    const [invoices, purchaseOrders, procurementRequests, vendors] =
      await Promise.all([
        this.prisma.invoice.findMany({
          where: { organisationId },
          include: { vendor: true, items: true },
        }),
        this.prisma.purchaseOrder.findMany({
          where: { organisationId },
          include: { vendor: true, items: true },
        }),
        this.prisma.procurementRequest.findMany({
          where: { organisationId },
          include: { items: true },
        }),
        this.prisma.vendor.findMany({ where: { organisationId } }),
      ]);

    return JSON.stringify(
      {
        invoiceCount: invoices.length,
        purchaseOrderCount: purchaseOrders.length,
        procurementRequestCount: procurementRequests.length,
        vendorCount: vendors.length,
        invoices: invoices.map((i) => ({
          id: i.id,
          invoiceNumber: i.invoiceNumber,
          vendor: i.vendor.name,
          category: i.vendor.category,
          totalAmount: i.totalAmount,
          status: i.status,
          invoiceDate: i.invoiceDate,
        })),
        purchaseOrders: purchaseOrders.map((po) => ({
          id: po.id,
          poNumber: po.poNumber,
          vendor: po.vendor.name,
          totalAmount: po.totalAmount,
          status: po.status,
        })),
        procurementRequests: procurementRequests.map((pr) => ({
          id: pr.id,
          title: pr.title,
          department: pr.department,
          estimatedBudget: pr.estimatedBudget,
          status: pr.status,
          items: pr.items,
        })),
      },
      null,
      2,
    );
  }

  async getOrganisationContext(organisationId: string): Promise<string> {
    const [vendors, requests, pos, invoices, contracts] = await Promise.all([
      this.prisma.vendor.count({ where: { organisationId } }),
      this.prisma.procurementRequest.findMany({
        where: { organisationId },
        take: 20,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          title: true,
          status: true,
          estimatedBudget: true,
          department: true,
        },
      }),
      this.prisma.purchaseOrder.findMany({
        where: { organisationId },
        take: 20,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          poNumber: true,
          status: true,
          totalAmount: true,
          vendorId: true,
        },
      }),
      this.prisma.invoice.findMany({
        where: { organisationId },
        take: 20,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          invoiceNumber: true,
          status: true,
          totalAmount: true,
        },
      }),
      this.prisma.contract.findMany({
        where: { organisationId },
        take: 10,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          contractNumber: true,
          title: true,
          status: true,
          endDate: true,
        },
      }),
    ]);

    return JSON.stringify(
      {
        summary: {
          vendors,
          recentRequests: requests.length,
          recentPos: pos.length,
        },
        procurementRequests: requests,
        purchaseOrders: pos,
        invoices,
        contracts,
      },
      null,
      2,
    );
  }
}
