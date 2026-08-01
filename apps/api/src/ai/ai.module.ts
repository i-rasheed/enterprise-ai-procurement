import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';

import { AuthModule } from '../auth/auth.module';
import { DatabaseModule } from '../database/database.module';
import { AiController } from './ai.controller';
import { AiDataContextService } from './ai-data-context.service';
import { AiRepository } from './ai.repository';
import { AiService } from './ai.service';
import { ChatService } from './chat/chat.service';
import aiConfig from './config/ai.config';
import { LLM_PROVIDER } from './constants/ai.constants';
import { EmbeddingService } from './embeddings/embedding.service';
import { OpenAIProvider } from './providers/openai.provider';
import { LlmProviderFactory } from './providers/provider.factory';
import { InvoiceAnomalyService } from './recommendations/invoice-anomaly.service';
import { ProcurementRecommendationsService } from './recommendations/procurement-recommendations.service';
import { SpendAnalysisService } from './recommendations/spend-analysis.service';
import { VendorRiskService } from './risk-analysis/vendor-risk.service';
import { ClauseExtractionService } from './summaries/clause-extraction.service';
import { ContractSummaryService } from './summaries/contract-summary.service';
import { VectorSearchService } from './vector-search/vector-search.service';

@Module({
  imports: [
    ConfigModule.forFeature(aiConfig),
    ThrottlerModule.forRoot([
      {
        name: 'default',
        ttl: 60_000,
        limit: 30,
      },
    ]),
    DatabaseModule,
    AuthModule,
  ],
  controllers: [AiController],
  providers: [
    AiRepository,
    AiDataContextService,
    OpenAIProvider,
    LlmProviderFactory,
    {
      provide: LLM_PROVIDER,
      useFactory: (factory: LlmProviderFactory) => factory.create(),
      inject: [LlmProviderFactory],
    },
    AiService,
    EmbeddingService,
    VectorSearchService,
    ContractSummaryService,
    ClauseExtractionService,
    VendorRiskService,
    ProcurementRecommendationsService,
    SpendAnalysisService,
    InvoiceAnomalyService,
    ChatService,
  ],
  exports: [AiService, EmbeddingService, VectorSearchService, AiRepository],
})
export class AiModule {}
