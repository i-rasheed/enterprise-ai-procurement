import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Role } from '@prisma/client';

export class EvaluatorResponseDto {
  @ApiProperty({ example: 'clx123abc456def' })
  id: string;

  @ApiProperty({ example: 'manager@globex.com' })
  email: string;

  @ApiProperty({ example: 'John' })
  firstName: string;

  @ApiProperty({ example: 'Smith' })
  lastName: string;

  @ApiProperty({ enum: Role, example: Role.PROCUREMENT_MANAGER })
  role: Role;
}

export class BidEvaluationResponseDto {
  @ApiProperty({ example: 'clxeval123' })
  id: string;

  @ApiProperty({ example: 'clxbid123' })
  bidId: string;

  @ApiProperty({ type: EvaluatorResponseDto })
  evaluator: EvaluatorResponseDto;

  @ApiProperty({ example: 85 })
  technicalScore: number;

  @ApiProperty({ example: 90 })
  commercialScore: number;

  @ApiProperty({ example: 88 })
  complianceScore: number;

  @ApiProperty({ example: 80 })
  deliveryScore: number;

  @ApiProperty({ example: 343 })
  totalScore: number;

  @ApiPropertyOptional({ example: 'Strong technical proposal.' })
  comments?: string | null;

  @ApiProperty({ example: '2026-08-01T10:00:00.000Z' })
  createdAt: string;

  @ApiProperty({ example: '2026-08-01T10:00:00.000Z' })
  updatedAt: string;
}

export class BidEvaluationListResponseDto {
  @ApiProperty({ example: 'clxbid123' })
  bidId: string;

  @ApiProperty({ type: [BidEvaluationResponseDto] })
  evaluations: BidEvaluationResponseDto[];

  @ApiProperty({ example: 343 })
  averageTotalScore: number;
}

export class BidRankingEntryDto {
  @ApiProperty({ example: 1 })
  rank: number;

  @ApiProperty({ example: 'clxbid123' })
  bidId: string;

  @ApiProperty({ example: 'BID-2026-000001' })
  bidNumber: string;

  @ApiProperty({ example: 'Globex Supplies Ltd' })
  vendorName: string;

  @ApiProperty({ example: 343 })
  totalScore: number;

  @ApiProperty({ example: 2400.0 })
  totalAmount: number;

  @ApiProperty({ example: 1 })
  evaluationCount: number;
}

export class ProcurementRankingsResponseDto {
  @ApiProperty({ example: 'clxprocurement123' })
  procurementRequestId: string;

  @ApiProperty({ type: [BidRankingEntryDto] })
  rankings: BidRankingEntryDto[];
}

export class AwardResponseDto {
  @ApiProperty({ example: 'clxaward123' })
  id: string;

  @ApiProperty({ example: 'clxbid123' })
  bidId: string;

  @ApiProperty({ example: 'clxprocurement123' })
  procurementRequestId: string;

  @ApiProperty({ type: EvaluatorResponseDto })
  awardedBy: EvaluatorResponseDto;

  @ApiProperty({
    example:
      'Best overall score with competitive pricing and verified compliance.',
  })
  awardReason: string;

  @ApiProperty({ example: '2026-08-01T12:00:00.000Z' })
  awardedAt: string;

  @ApiProperty({ example: '2026-08-01T12:00:00.000Z' })
  createdAt: string;

  @ApiProperty({ example: '2026-08-01T12:00:00.000Z' })
  updatedAt: string;
}

export class AwardListResponseDto {
  @ApiProperty({ type: [AwardResponseDto] })
  awards: AwardResponseDto[];
}
