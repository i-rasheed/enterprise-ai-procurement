import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { BidStatus } from '@prisma/client';

import { BidRepository } from '../bids/bid.repository';
import { ProcurementRepository } from '../procurement/procurement.repository';
import { AwardBidDto } from './dto/award-bid.dto';
import { CreateEvaluationDto } from './dto/create-evaluation.dto';
import { UpdateEvaluationDto } from './dto/update-evaluation.dto';
import {
  BidEvaluationWithRelations,
  EvaluationRepository,
} from './evaluation.repository';

@Injectable()
export class BidEvaluationService {
  constructor(
    private readonly evaluationRepository: EvaluationRepository,
    private readonly bidRepository: BidRepository,
    private readonly procurementRepository: ProcurementRepository,
  ) {}

  async createEvaluation(
    organisationId: string,
    evaluatorId: string,
    dto: CreateEvaluationDto,
  ) {
    const bid = await this.bidRepository.findById(dto.bidId, organisationId);

    if (!bid) {
      throw new NotFoundException('Bid not found');
    }

    this.assertEvaluableBid(
      bid.status,
      bid.rfq.procurementRequest.organisationId,
      organisationId,
    );

    const totalScore = this.calculateTotalScore(
      dto.technicalScore,
      dto.commercialScore,
      dto.complianceScore,
      dto.deliveryScore,
    );

    try {
      const evaluation = await this.evaluationRepository.createEvaluation({
        technicalScore: dto.technicalScore,
        commercialScore: dto.commercialScore,
        complianceScore: dto.complianceScore,
        deliveryScore: dto.deliveryScore,
        totalScore,
        comments: dto.comments,
        bid: { connect: { id: dto.bidId } },
        evaluator: { connect: { id: evaluatorId } },
      });

      await this.evaluationRepository.ensureDefaultCriteria(organisationId);

      return this.mapEvaluation(evaluation);
    } catch (error) {
      if (this.isUniqueViolation(error)) {
        throw new ConflictException('You have already evaluated this bid');
      }

      throw error;
    }
  }

  async updateEvaluation(
    organisationId: string,
    id: string,
    dto: UpdateEvaluationDto,
  ) {
    const evaluation = await this.evaluationRepository.findEvaluationById(
      id,
      organisationId,
    );

    if (!evaluation) {
      throw new NotFoundException('Bid evaluation not found');
    }

    this.assertEvaluationEditable(evaluation);

    const technicalScore = dto.technicalScore ?? evaluation.technicalScore;
    const commercialScore = dto.commercialScore ?? evaluation.commercialScore;
    const complianceScore = dto.complianceScore ?? evaluation.complianceScore;
    const deliveryScore = dto.deliveryScore ?? evaluation.deliveryScore;

    const totalScore = this.calculateTotalScore(
      technicalScore,
      commercialScore,
      complianceScore,
      deliveryScore,
    );

    const updated = await this.evaluationRepository.updateEvaluation(id, {
      technicalScore,
      commercialScore,
      complianceScore,
      deliveryScore,
      totalScore,
      comments: dto.comments,
    });

    return this.mapEvaluation(updated);
  }

  async getEvaluations(organisationId: string, bidId: string) {
    const bid = await this.bidRepository.findById(bidId, organisationId);

    if (!bid) {
      throw new NotFoundException('Bid not found');
    }

    const evaluations = await this.evaluationRepository.findEvaluations(
      bidId,
      organisationId,
    );

    return this.buildEvaluationSummary(bidId, evaluations);
  }

  async getRankings(organisationId: string, procurementRequestId: string) {
    const request = await this.procurementRepository.findById(
      procurementRequestId,
      organisationId,
    );

    if (!request) {
      throw new NotFoundException('Procurement request not found');
    }

    const evaluations =
      await this.evaluationRepository.findEvaluationsByProcurementRequest(
        procurementRequestId,
        organisationId,
      );

    const bidScores = new Map<
      string,
      {
        bidId: string;
        bidNumber: string;
        vendorName: string;
        totalAmount: number;
        scores: number[];
      }
    >();

    for (const evaluation of evaluations) {
      const existing = bidScores.get(evaluation.bidId) ?? {
        bidId: evaluation.bid.id,
        bidNumber: evaluation.bid.bidNumber,
        vendorName: evaluation.bid.vendor.name,
        totalAmount: Number(evaluation.bid.totalAmount.toFixed(2)),
        scores: [],
      };

      existing.scores.push(evaluation.totalScore);
      bidScores.set(evaluation.bidId, existing);
    }

    const rankings = Array.from(bidScores.values())
      .map((entry) => ({
        bidId: entry.bidId,
        bidNumber: entry.bidNumber,
        vendorName: entry.vendorName,
        totalScore: this.average(entry.scores),
        totalAmount: entry.totalAmount,
        evaluationCount: entry.scores.length,
      }))
      .sort((a, b) => {
        if (b.totalScore !== a.totalScore) {
          return b.totalScore - a.totalScore;
        }

        return a.totalAmount - b.totalAmount;
      })
      .map((entry, index) => ({
        rank: index + 1,
        ...entry,
      }));

    return {
      procurementRequestId,
      rankings,
    };
  }

  async awardBid(
    organisationId: string,
    awardedById: string,
    dto: AwardBidDto,
  ) {
    const bid = await this.bidRepository.findById(dto.bidId, organisationId);

    if (!bid) {
      throw new NotFoundException('Bid not found');
    }

    if (bid.status !== BidStatus.SUBMITTED) {
      throw new BadRequestException('Only submitted bids may be awarded');
    }

    const procurementRequestId = bid.rfq.procurementRequestId;

    const existingAward =
      await this.evaluationRepository.findAwardByProcurementRequest(
        procurementRequestId,
        organisationId,
      );

    if (existingAward) {
      throw new ConflictException(
        'An award already exists for this procurement request',
      );
    }

    const evaluations = await this.evaluationRepository.findEvaluations(
      dto.bidId,
      organisationId,
    );

    if (evaluations.length === 0) {
      throw new BadRequestException(
        'Bid must be evaluated before it can be awarded',
      );
    }

    const award = await this.evaluationRepository.awardBid({
      awardReason: dto.awardReason,
      awardedAt: new Date(),
      bid: { connect: { id: dto.bidId } },
      procurementRequest: { connect: { id: procurementRequestId } },
      awardedBy: { connect: { id: awardedById } },
    });

    return this.mapAward(award);
  }

  async listAwards(organisationId: string) {
    const awards = await this.evaluationRepository.listAwards(organisationId);

    return {
      awards: awards.map((award) => this.mapAward(award)),
    };
  }

  async getAward(organisationId: string, id: string) {
    const award = await this.evaluationRepository.findAward(id, organisationId);

    if (!award) {
      throw new NotFoundException('Award not found');
    }

    return this.mapAward(award);
  }

  async findWinningBid(organisationId: string, procurementRequestId: string) {
    const award = await this.evaluationRepository.findWinningBid(
      procurementRequestId,
      organisationId,
    );

    if (!award) {
      throw new NotFoundException(
        'No winning bid found for this procurement request',
      );
    }

    return this.mapAward(award);
  }

  calculateTotalScore(
    technicalScore: number,
    commercialScore: number,
    complianceScore: number,
    deliveryScore: number,
  ) {
    return Number(
      (
        technicalScore +
        commercialScore +
        complianceScore +
        deliveryScore
      ).toFixed(2),
    );
  }

  private assertEvaluableBid(
    status: BidStatus,
    bidOrgId: string,
    orgId: string,
  ) {
    if (bidOrgId !== orgId) {
      throw new ForbiddenException('Bid does not belong to your organisation');
    }

    if (status !== BidStatus.SUBMITTED) {
      throw new BadRequestException('Only submitted bids may be evaluated');
    }
  }

  private assertEvaluationEditable(evaluation: BidEvaluationWithRelations) {
    if (evaluation.bid.award) {
      throw new BadRequestException('Awarded bids cannot be edited');
    }

    if (evaluation.bid.status === BidStatus.AWARDED) {
      throw new BadRequestException('Awarded bids cannot be edited');
    }
  }

  private buildEvaluationSummary(
    bidId: string,
    evaluations: BidEvaluationWithRelations[],
  ) {
    const averageTotalScore =
      evaluations.length > 0
        ? this.average(evaluations.map((item) => item.totalScore))
        : 0;

    return {
      bidId,
      evaluations: evaluations.map((evaluation) =>
        this.mapEvaluation(evaluation),
      ),
      averageTotalScore,
    };
  }

  private average(values: number[]) {
    if (values.length === 0) {
      return 0;
    }

    const sum = values.reduce((total, value) => total + value, 0);

    return Number((sum / values.length).toFixed(2));
  }

  private isUniqueViolation(error: unknown) {
    return (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      error.code === 'P2002'
    );
  }

  private mapEvaluation(evaluation: BidEvaluationWithRelations) {
    return {
      id: evaluation.id,
      bidId: evaluation.bidId,
      evaluator: evaluation.evaluator,
      technicalScore: evaluation.technicalScore,
      commercialScore: evaluation.commercialScore,
      complianceScore: evaluation.complianceScore,
      deliveryScore: evaluation.deliveryScore,
      totalScore: evaluation.totalScore,
      comments: evaluation.comments,
      createdAt: evaluation.createdAt.toISOString(),
      updatedAt: evaluation.updatedAt.toISOString(),
    };
  }

  private mapAward(award: {
    id: string;
    bidId: string;
    procurementRequestId: string;
    awardedBy: BidEvaluationWithRelations['evaluator'];
    awardReason: string;
    awardedAt: Date;
    createdAt: Date;
    updatedAt: Date;
  }) {
    return {
      id: award.id,
      bidId: award.bidId,
      procurementRequestId: award.procurementRequestId,
      awardedBy: award.awardedBy,
      awardReason: award.awardReason,
      awardedAt: award.awardedAt.toISOString(),
      createdAt: award.createdAt.toISOString(),
      updatedAt: award.updatedAt.toISOString(),
    };
  }
}
