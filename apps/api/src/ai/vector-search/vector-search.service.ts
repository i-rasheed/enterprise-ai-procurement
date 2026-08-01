import { Injectable } from '@nestjs/common';
import { EmbeddingEntityType } from '@prisma/client';

import { PrismaService } from '../../database/prisma.service';
import { AiRepository } from '../ai.repository';
import { EmbeddingService } from '../embeddings/embedding.service';

export type SemanticSearchResult = {
  entityType: EmbeddingEntityType;
  entityId: string;
  score: number;
  snippet: string;
};

@Injectable()
export class VectorSearchService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly embeddingService: EmbeddingService,
    private readonly aiRepository: AiRepository,
  ) {}

  async search(
    organisationId: string,
    query: string,
    entityTypes?: EmbeddingEntityType[],
    limit = 10,
  ): Promise<SemanticSearchResult[]> {
    await this.indexOrganisationEntities(organisationId, entityTypes);

    const queryEmbedding = await this.embeddingService.generateEmbedding(query);
    const records = await this.aiRepository.findEmbeddingsByOrganisation(
      organisationId,
      entityTypes,
    );

    return records
      .map((record) => ({
        entityType: record.entityType,
        entityId: record.entityId,
        score: this.cosineSimilarity(
          queryEmbedding,
          record.embedding as number[],
        ),
        snippet: record.content.slice(0, 300),
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  }

  private cosineSimilarity(a: number[], b: number[]): number {
    if (a.length !== b.length || a.length === 0) {
      return 0;
    }

    let dot = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < a.length; i++) {
      dot += a[i] * b[i];
      normA += a[i] * a[i];
      normB += b[i] * b[i];
    }

    const denominator = Math.sqrt(normA) * Math.sqrt(normB);
    return denominator === 0 ? 0 : dot / denominator;
  }

  private async indexOrganisationEntities(
    organisationId: string,
    entityTypes?: EmbeddingEntityType[],
  ): Promise<void> {
    const types = entityTypes ?? [
      EmbeddingEntityType.CONTRACT,
      EmbeddingEntityType.RFQ,
      EmbeddingEntityType.PURCHASE_ORDER,
      EmbeddingEntityType.INVOICE,
      EmbeddingEntityType.PROCUREMENT_REQUEST,
      EmbeddingEntityType.BID,
    ];

    for (const entityType of types) {
      const entities = await this.fetchEntitiesForIndexing(
        organisationId,
        entityType,
      );
      await Promise.all(
        entities.map((entity) =>
          this.embeddingService.ensureEmbedding(
            organisationId,
            entityType,
            entity.id,
            entity.content,
          ),
        ),
      );
    }
  }

  private async fetchEntitiesForIndexing(
    organisationId: string,
    entityType: EmbeddingEntityType,
  ): Promise<{ id: string; content: string }[]> {
    switch (entityType) {
      case EmbeddingEntityType.CONTRACT: {
        const contracts = await this.prisma.contract.findMany({
          where: { organisationId },
          select: {
            id: true,
            contractNumber: true,
            title: true,
            description: true,
            status: true,
            renewalType: true,
            renewalDate: true,
            autoRenew: true,
          },
        });
        return contracts.map((c) => ({
          id: c.id,
          content: `${c.contractNumber} ${c.title} ${c.description} ${c.status} ${c.renewalType ?? ''} ${c.autoRenew}`,
        }));
      }
      case EmbeddingEntityType.RFQ: {
        const rfqs = await this.prisma.rFQ.findMany({
          where: { procurementRequest: { organisationId } },
          select: {
            id: true,
            rfqNumber: true,
            title: true,
            description: true,
            status: true,
          },
        });
        return rfqs.map((r) => ({
          id: r.id,
          content: `${r.rfqNumber} ${r.title} ${r.description} ${r.status}`,
        }));
      }
      case EmbeddingEntityType.PURCHASE_ORDER: {
        const pos = await this.prisma.purchaseOrder.findMany({
          where: { organisationId },
          select: {
            id: true,
            poNumber: true,
            status: true,
            paymentTerms: true,
            notes: true,
          },
        });
        return pos.map((po) => ({
          id: po.id,
          content: `${po.poNumber} ${po.status} ${po.paymentTerms ?? ''} ${po.notes ?? ''}`,
        }));
      }
      case EmbeddingEntityType.INVOICE: {
        const invoices = await this.prisma.invoice.findMany({
          where: { organisationId },
          select: {
            id: true,
            invoiceNumber: true,
            status: true,
            notes: true,
            totalAmount: true,
          },
        });
        return invoices.map((i) => ({
          id: i.id,
          content: `${i.invoiceNumber} ${i.status} ${i.notes ?? ''} ${String(i.totalAmount)}`,
        }));
      }
      case EmbeddingEntityType.PROCUREMENT_REQUEST: {
        const requests = await this.prisma.procurementRequest.findMany({
          where: { organisationId },
          select: {
            id: true,
            title: true,
            description: true,
            department: true,
            status: true,
          },
        });
        return requests.map((r) => ({
          id: r.id,
          content: `${r.title} ${r.description} ${r.department} ${r.status}`,
        }));
      }
      case EmbeddingEntityType.BID: {
        const bids = await this.prisma.bid.findMany({
          where: { rfq: { procurementRequest: { organisationId } } },
          select: {
            id: true,
            bidNumber: true,
            status: true,
            notes: true,
            paymentTerms: true,
          },
        });
        return bids.map((b) => ({
          id: b.id,
          content: `${b.bidNumber} ${b.status} ${b.notes ?? ''} ${b.paymentTerms ?? ''}`,
        }));
      }
      default:
        return [];
    }
  }
}
