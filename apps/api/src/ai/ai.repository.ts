import { Injectable } from '@nestjs/common';
import { AiPromptLog, EmbeddingEntityType, Prisma } from '@prisma/client';

import { PrismaService } from '../database/prisma.service';

export type CreatePromptLogInput = {
  organisationId: string;
  userId: string;
  feature: string;
  prompt: string;
  response: string;
  model: string;
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  executionTimeMs: number;
};

export type UpsertEmbeddingInput = {
  organisationId: string;
  entityType: EmbeddingEntityType;
  entityId: string;
  content: string;
  embedding: number[];
  model: string;
};

@Injectable()
export class AiRepository {
  constructor(private readonly prisma: PrismaService) {}

  createPromptLog(data: CreatePromptLogInput): Promise<AiPromptLog> {
    return this.prisma.aiPromptLog.create({ data });
  }

  findPromptLogs(
    organisationId: string,
    feature?: string,
    limit = 50,
  ): Promise<AiPromptLog[]> {
    return this.prisma.aiPromptLog.findMany({
      where: {
        organisationId,
        ...(feature ? { feature } : {}),
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  upsertEmbedding(data: UpsertEmbeddingInput) {
    return this.prisma.embeddingRecord.upsert({
      where: {
        entityType_entityId: {
          entityType: data.entityType,
          entityId: data.entityId,
        },
      },
      create: {
        organisationId: data.organisationId,
        entityType: data.entityType,
        entityId: data.entityId,
        content: data.content,
        embedding: data.embedding as Prisma.InputJsonValue,
        model: data.model,
      },
      update: {
        content: data.content,
        embedding: data.embedding as Prisma.InputJsonValue,
        model: data.model,
      },
    });
  }

  findEmbedding(entityType: EmbeddingEntityType, entityId: string) {
    return this.prisma.embeddingRecord.findUnique({
      where: {
        entityType_entityId: { entityType, entityId },
      },
    });
  }

  findEmbeddingsByOrganisation(
    organisationId: string,
    entityTypes?: EmbeddingEntityType[],
  ) {
    return this.prisma.embeddingRecord.findMany({
      where: {
        organisationId,
        ...(entityTypes?.length ? { entityType: { in: entityTypes } } : {}),
      },
    });
  }

  getUsageStats(organisationId: string, since?: Date) {
    return this.prisma.aiPromptLog.aggregate({
      where: {
        organisationId,
        ...(since ? { createdAt: { gte: since } } : {}),
      },
      _sum: {
        promptTokens: true,
        completionTokens: true,
        totalTokens: true,
      },
      _count: { id: true },
      _avg: { executionTimeMs: true },
    });
  }
}
