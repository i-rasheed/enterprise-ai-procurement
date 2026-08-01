import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiOperation,
  ApiServiceUnavailableResponse,
  ApiTags,
  ApiTooManyRequestsResponse,
} from '@nestjs/swagger';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';

import { CurrentUser } from '../auth/decorators/current-user/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt/jwt.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { TenantGuard } from '../auth/guards/tenant.guard';
import {
  chatRequestExample,
  chatResponseExample,
  clauseExtractionResponseExample,
  contractSummaryResponseExample,
  invoiceAnomalyResponseExample,
  procurementRecommendationsResponseExample,
  semanticSearchRequestExample,
  semanticSearchResponseExample,
  spendAnalysisRequestExample,
  spendAnalysisResponseExample,
  vendorRiskResponseExample,
} from '../common/swagger/swagger-examples';
import type { JwtPayload } from '../common/types/jwt-payload.interface';
import { ChatService } from './chat/chat.service';
import { AI_ACCESS_ROLES } from './constants/ai-role.constants';
import {
  ChatDto,
  ChatResponseDto,
  RecommendationResponseDto,
  RiskAnalysisResponseDto,
  SemanticSearchDto,
  SemanticSearchResponseDto,
  SpendAnalysisDto,
  SpendAnalysisResponseDto,
  SummaryResponseDto,
} from './dto/ai.dto';
import { ProcurementRecommendationsService } from './recommendations/procurement-recommendations.service';
import { InvoiceAnomalyService } from './recommendations/invoice-anomaly.service';
import { SpendAnalysisService } from './recommendations/spend-analysis.service';
import { VendorRiskService } from './risk-analysis/vendor-risk.service';
import { ClauseExtractionService } from './summaries/clause-extraction.service';
import { ContractSummaryService } from './summaries/contract-summary.service';
import { VectorSearchService } from './vector-search/vector-search.service';

@ApiTags('ai')
@ApiBearerAuth('JWT-auth')
@Controller('ai')
@UseGuards(JwtAuthGuard, TenantGuard, RolesGuard, ThrottlerGuard)
@Roles(...AI_ACCESS_ROLES)
@Throttle({ default: { limit: 30, ttl: 60_000 } })
export class AiController {
  constructor(
    private readonly contractSummaryService: ContractSummaryService,
    private readonly clauseExtractionService: ClauseExtractionService,
    private readonly vendorRiskService: VendorRiskService,
    private readonly procurementRecommendationsService: ProcurementRecommendationsService,
    private readonly spendAnalysisService: SpendAnalysisService,
    private readonly invoiceAnomalyService: InvoiceAnomalyService,
    private readonly chatService: ChatService,
    private readonly vectorSearchService: VectorSearchService,
  ) {}

  @Post('contracts/:id/summarize')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Generate AI contract summary' })
  @ApiOkResponse({
    type: SummaryResponseDto,
    schema: { example: contractSummaryResponseExample },
  })
  @ApiServiceUnavailableResponse({ description: 'AI provider unavailable' })
  @ApiTooManyRequestsResponse({ description: 'Rate limit exceeded' })
  @ApiForbiddenResponse({ description: 'Insufficient permissions' })
  summarizeContract(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.contractSummaryService.summarize(
      id,
      user.organisationId!,
      user.sub,
    );
  }

  @Post('contracts/:id/extract-clauses')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Extract key clauses from contract using AI' })
  @ApiOkResponse({ schema: { example: clauseExtractionResponseExample } })
  extractClauses(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.clauseExtractionService.extractClauses(
      id,
      user.organisationId!,
      user.sub,
    );
  }

  @Post('vendors/:id/risk')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Analyze vendor risk using AI' })
  @ApiOkResponse({
    type: RiskAnalysisResponseDto,
    schema: { example: vendorRiskResponseExample },
  })
  analyzeVendorRisk(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.vendorRiskService.analyzeRisk(
      id,
      user.organisationId!,
      user.sub,
    );
  }

  @Post('procurement/:id/recommendations')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get AI procurement recommendations' })
  @ApiOkResponse({
    type: RecommendationResponseDto,
    schema: { example: procurementRecommendationsResponseExample },
  })
  getRecommendations(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.procurementRecommendationsService.getRecommendations(
      id,
      user.organisationId!,
      user.sub,
    );
  }

  @Post('analytics/spend-analysis')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Generate AI spend analysis' })
  @ApiBody({
    type: SpendAnalysisDto,
    examples: { default: { value: spendAnalysisRequestExample } },
  })
  @ApiOkResponse({
    type: SpendAnalysisResponseDto,
    schema: { example: spendAnalysisResponseExample },
  })
  analyzeSpend(@CurrentUser() user: JwtPayload, @Body() dto: SpendAnalysisDto) {
    return this.spendAnalysisService.analyze(
      user.organisationId!,
      user.sub,
      dto.department,
    );
  }

  @Post('invoices/:id/analyze')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Detect invoice anomalies using AI' })
  @ApiOkResponse({ schema: { example: invoiceAnomalyResponseExample } })
  analyzeInvoice(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.invoiceAnomalyService.analyze(
      id,
      user.organisationId!,
      user.sub,
    );
  }

  @Post('chat')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Procurement chat assistant' })
  @ApiBody({
    type: ChatDto,
    examples: { default: { value: chatRequestExample } },
  })
  @ApiOkResponse({
    type: ChatResponseDto,
    schema: { example: chatResponseExample },
  })
  chat(@CurrentUser() user: JwtPayload, @Body() dto: ChatDto) {
    return this.chatService.chat(
      user.organisationId!,
      user.sub,
      dto.question,
      dto.context,
      dto.conversationHistory,
    );
  }

  @Post('search')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Semantic search across procurement records' })
  @ApiBody({
    type: SemanticSearchDto,
    examples: { default: { value: semanticSearchRequestExample } },
  })
  @ApiOkResponse({
    type: SemanticSearchResponseDto,
    schema: { example: semanticSearchResponseExample },
  })
  async semanticSearch(
    @CurrentUser() user: JwtPayload,
    @Body() dto: SemanticSearchDto,
  ) {
    const results = await this.vectorSearchService.search(
      user.organisationId!,
      dto.query,
      dto.entityTypes,
      dto.limit ?? 10,
    );
    return { results };
  }
}
