import { Injectable } from '@nestjs/common';
import { BidStatus, Prisma } from '@prisma/client';

import { PrismaService } from '../database/prisma.service';

export const bidEvaluationInclude = {
  evaluator: {
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      role: true,
    },
  },
  bid: {
    select: {
      id: true,
      bidNumber: true,
      totalAmount: true,
      status: true,
      vendor: { select: { id: true, name: true } },
      rfq: {
        select: {
          procurementRequestId: true,
          procurementRequest: { select: { organisationId: true } },
        },
      },
      award: { select: { id: true } },
    },
  },
} satisfies Prisma.BidEvaluationInclude;

export type BidEvaluationWithRelations = Prisma.BidEvaluationGetPayload<{
  include: typeof bidEvaluationInclude;
}>;

export const awardInclude = {
  awardedBy: {
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      role: true,
    },
  },
  bid: {
    select: {
      id: true,
      bidNumber: true,
      vendor: { select: { id: true, name: true } },
    },
  },
  procurementRequest: {
    select: { id: true, title: true },
  },
} satisfies Prisma.AwardInclude;

export type AwardWithRelations = Prisma.AwardGetPayload<{
  include: typeof awardInclude;
}>;

@Injectable()
export class EvaluationRepository {
  constructor(private readonly prisma: PrismaService) {}

  createEvaluation(
    data: Prisma.BidEvaluationCreateInput,
  ): Promise<BidEvaluationWithRelations> {
    return this.prisma.bidEvaluation.create({
      data,
      include: bidEvaluationInclude,
    });
  }

  updateEvaluation(
    id: string,
    data: Prisma.BidEvaluationUpdateInput,
  ): Promise<BidEvaluationWithRelations> {
    return this.prisma.bidEvaluation.update({
      where: { id },
      data,
      include: bidEvaluationInclude,
    });
  }

  findEvaluationById(id: string, organisationId: string) {
    return this.prisma.bidEvaluation.findFirst({
      where: {
        id,
        bid: {
          rfq: { procurementRequest: { organisationId } },
        },
      },
      include: bidEvaluationInclude,
    });
  }

  findEvaluations(
    bidId: string,
    organisationId: string,
  ): Promise<BidEvaluationWithRelations[]> {
    return this.prisma.bidEvaluation.findMany({
      where: {
        bidId,
        bid: {
          rfq: { procurementRequest: { organisationId } },
        },
      },
      include: bidEvaluationInclude,
      orderBy: { createdAt: 'desc' },
    });
  }

  findEvaluationsByProcurementRequest(
    procurementRequestId: string,
    organisationId: string,
  ): Promise<BidEvaluationWithRelations[]> {
    return this.prisma.bidEvaluation.findMany({
      where: {
        bid: {
          rfq: {
            procurementRequestId,
            procurementRequest: { organisationId },
          },
          status: { in: [BidStatus.SUBMITTED, BidStatus.AWARDED] },
        },
      },
      include: bidEvaluationInclude,
    });
  }

  findWinningBid(procurementRequestId: string, organisationId: string) {
    return this.prisma.award.findFirst({
      where: {
        procurementRequestId,
        procurementRequest: { organisationId },
      },
      include: awardInclude,
    });
  }

  awardBid(data: Prisma.AwardCreateInput): Promise<AwardWithRelations> {
    return this.prisma.$transaction(async (tx) => {
      const award = await tx.award.create({
        data,
        include: awardInclude,
      });

      await tx.bid.update({
        where: { id: award.bidId },
        data: { status: BidStatus.AWARDED },
      });

      return award;
    });
  }

  findAward(id: string, organisationId: string) {
    return this.prisma.award.findFirst({
      where: {
        id,
        procurementRequest: { organisationId },
      },
      include: awardInclude,
    });
  }

  findAwardByProcurementRequest(
    procurementRequestId: string,
    organisationId: string,
  ) {
    return this.prisma.award.findFirst({
      where: {
        procurementRequestId,
        procurementRequest: { organisationId },
      },
      include: awardInclude,
    });
  }

  listAwards(organisationId: string): Promise<AwardWithRelations[]> {
    return this.prisma.award.findMany({
      where: {
        procurementRequest: { organisationId },
      },
      include: awardInclude,
      orderBy: { awardedAt: 'desc' },
    });
  }

  async ensureDefaultCriteria(organisationId: string) {
    const count = await this.prisma.evaluationCriteria.count({
      where: { organisationId },
    });

    if (count > 0) {
      return;
    }

    const defaults = [
      {
        name: 'Technical',
        description: 'Technical capability and specification fit',
        weight: 1,
      },
      {
        name: 'Commercial',
        description: 'Pricing and commercial terms competitiveness',
        weight: 1,
      },
      {
        name: 'Compliance',
        description: 'Regulatory and policy compliance',
        weight: 1,
      },
      {
        name: 'Delivery',
        description: 'Delivery timeline and logistics capability',
        weight: 1,
      },
    ];

    return this.prisma.evaluationCriteria.createMany({
      data: defaults.map((criteria) => ({
        ...criteria,
        organisationId,
      })),
    });
  }
}
