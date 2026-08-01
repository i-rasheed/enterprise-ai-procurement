import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { EmbeddingEntityType } from '@prisma/client';
import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';

export class ChatMessageDto {
  @ApiProperty({ enum: ['user', 'assistant'], example: 'user' })
  @IsString()
  @IsNotEmpty()
  role!: 'user' | 'assistant';

  @ApiProperty({ example: 'What is our total spend with Globex Supplies?' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(4000)
  content!: string;
}

export class ChatDto {
  @ApiProperty({
    example: 'Which vendors have the highest delivery risk this quarter?',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(2000)
  question!: string;

  @ApiPropertyOptional({
    example: 'Focus on IT hardware procurement for Q3.',
  })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  context?: string;

  @ApiPropertyOptional({ type: [ChatMessageDto] })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(20)
  @ValidateNested({ each: true })
  @Type(() => ChatMessageDto)
  conversationHistory?: ChatMessageDto[];
}

export class SpendAnalysisDto {
  @ApiPropertyOptional({ example: 'IT' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  department?: string;
}

export class SemanticSearchDto {
  @ApiProperty({ example: 'payment terms renewal clause' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  query!: string;

  @ApiPropertyOptional({
    enum: EmbeddingEntityType,
    isArray: true,
    example: [EmbeddingEntityType.CONTRACT, EmbeddingEntityType.INVOICE],
  })
  @IsOptional()
  @IsArray()
  @IsEnum(EmbeddingEntityType, { each: true })
  entityTypes?: EmbeddingEntityType[];

  @ApiPropertyOptional({ example: 10, default: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  limit?: number;
}

export class SummaryResponseDto {
  @ApiProperty({ example: 'clxcontract123' })
  contractId!: string;

  @ApiProperty({
    example:
      'Three-year IT services agreement with Globex Supplies covering cloud infrastructure support.',
  })
  executiveSummary!: string;

  @ApiProperty({
    example: [
      {
        label: 'Contract Start',
        date: '2026-01-01',
        description: 'Service commencement date',
      },
    ],
  })
  importantDates!: unknown[];

  @ApiProperty({
    example: ['Monthly SLA reporting', 'Quarterly business review'],
  })
  obligations!: string[];

  @ApiProperty({
    example: [
      {
        risk: 'Auto-renewal without cap',
        severity: 'MEDIUM',
        mitigation: 'Negotiate renewal notice period',
      },
    ],
  })
  risks!: unknown[];

  @ApiProperty({
    example: {
      autoRenewal: true,
      renewalDate: '2029-01-01',
      noticePeriod: '90 days',
      terms: 'Annual renewal at CPI adjustment',
    },
  })
  renewalInformation!: Record<string, unknown>;
}

export class RiskAnalysisResponseDto {
  @ApiProperty({ example: 'clxvendor456' })
  vendorId!: string;

  @ApiProperty({ example: 42 })
  riskScore!: number;

  @ApiProperty({ example: { score: 35, factors: ['Stable payment history'] } })
  financialRisk!: Record<string, unknown>;

  @ApiProperty({ example: { score: 55, factors: ['Two late deliveries'] } })
  deliveryRisk!: Record<string, unknown>;

  @ApiProperty({ example: { score: 20, factors: ['Verified compliance'] } })
  complianceRisk!: Record<string, unknown>;

  @ApiProperty({
    example: { score: 40, factors: ['Single-source dependency'] },
  })
  operationalRisk!: Record<string, unknown>;

  @ApiProperty({
    example: 'Continue engagement with enhanced delivery KPI monitoring.',
  })
  overallRecommendation!: string;
}

export class RecommendationResponseDto {
  @ApiProperty({ example: 'clxproc789' })
  procurementRequestId!: string;

  @ApiProperty({
    example: [
      {
        vendorName: 'Globex Supplies',
        reason: 'Best evaluated bid score',
        estimatedSavings: 15000,
      },
    ],
  })
  preferredVendors!: unknown[];

  @ApiProperty({ example: ['Consolidate laptop orders for volume discount'] })
  savingsOpportunities!: string[];

  @ApiProperty({
    example: [
      {
        name: 'Initech Corp',
        category: 'IT Hardware',
        rationale: 'Competitive pricing',
      },
    ],
  })
  alternativeSuppliers!: unknown[];

  @ApiProperty({
    example:
      'Run competitive RFQ with three qualified vendors and negotiate framework pricing.',
  })
  procurementStrategy!: string;
}

export class SpendAnalysisResponseDto {
  @ApiProperty({
    example: [{ category: 'IT Hardware', totalSpend: 250000, percentage: 35 }],
  })
  topCategories!: unknown[];

  @ApiProperty({
    example: [
      {
        area: 'Software licenses',
        amount: 45000,
        recommendation: 'Renegotiate EA',
      },
    ],
  })
  overspending!: unknown[];

  @ApiProperty({
    example: [
      { vendor: 'Globex Supplies', spendShare: 42, risk: 'High concentration' },
    ],
  })
  vendorConcentration!: unknown[];

  @ApiProperty({
    example: [
      {
        opportunity: 'Vendor consolidation',
        estimatedSaving: 80000,
        effort: 'MEDIUM',
      },
    ],
  })
  costReductionOpportunities!: unknown[];
}

export class ChatResponseDto {
  @ApiProperty({ example: 'Which vendors have the highest delivery risk?' })
  question!: string;

  @ApiProperty({
    example:
      'Based on recent purchase orders and goods receipts, Globex Supplies shows elevated delivery risk due to two partial deliveries.',
  })
  answer!: string;

  @ApiProperty({
    example: [
      {
        entityType: 'VENDOR',
        entityId: 'clxvendor456',
        score: 0.87,
        snippet: 'Globex Supplies delivery performance...',
      },
    ],
  })
  relevantRecords!: unknown[];

  @ApiProperty({ example: 'openai' })
  provider!: string;
}

export class SemanticSearchResponseDto {
  @ApiProperty({
    example: [
      {
        entityType: 'CONTRACT',
        entityId: 'clxcontract123',
        score: 0.91,
        snippet: 'CTR-2026-000001 Cloud Services Agreement...',
      },
    ],
  })
  results!: unknown[];
}
