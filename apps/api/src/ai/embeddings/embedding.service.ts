import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EmbeddingEntityType } from '@prisma/client';

import { AiRepository } from '../ai.repository';
import { AI_CONFIG_KEY } from '../config/ai.config';
import { LLM_PROVIDER } from '../constants/ai.constants';
import type { LLMProvider } from '../providers/llm-provider.interface';

@Injectable()
export class EmbeddingService {
  constructor(
    @Inject(LLM_PROVIDER) private readonly llmProvider: LLMProvider,
    private readonly aiRepository: AiRepository,
    private readonly configService: ConfigService,
  ) {}

  private getEmbeddingModel(): string {
    return this.configService.get<string>(
      `${AI_CONFIG_KEY}.embeddingModel`,
      'text-embedding-3-small',
    );
  }

  async generateEmbedding(text: string): Promise<number[]> {
    const [embedding] = await this.llmProvider.embed([text]);
    return embedding;
  }

  async storeEmbedding(
    organisationId: string,
    entityType: EmbeddingEntityType,
    entityId: string,
    content: string,
  ) {
    const embedding = await this.generateEmbedding(content);
    return this.aiRepository.upsertEmbedding({
      organisationId,
      entityType,
      entityId,
      content,
      embedding,
      model: this.getEmbeddingModel(),
    });
  }

  async getStoredEmbedding(entityType: EmbeddingEntityType, entityId: string) {
    return this.aiRepository.findEmbedding(entityType, entityId);
  }

  async ensureEmbedding(
    organisationId: string,
    entityType: EmbeddingEntityType,
    entityId: string,
    content: string,
  ): Promise<number[]> {
    const existing = await this.aiRepository.findEmbedding(
      entityType,
      entityId,
    );
    if (existing) {
      return existing.embedding as number[];
    }

    const record = await this.storeEmbedding(
      organisationId,
      entityType,
      entityId,
      content,
    );
    return record.embedding as number[];
  }
}
