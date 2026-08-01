import { Injectable } from '@nestjs/common';
import {
  ApprovalStatus,
  Prisma,
  ProcurementStatus,
  WorkflowStatus,
} from '@prisma/client';

import { PrismaService } from '../database/prisma.service';
import { MAX_APPROVAL_LEVEL } from './constants/approval-levels.constants';

export const approvalWorkflowInclude = {
  steps: {
    orderBy: { level: 'asc' as const },
    include: {
      approver: {
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
        },
      },
    },
  },
  procurementRequest: {
    select: {
      id: true,
      organisationId: true,
      status: true,
    },
  },
} satisfies Prisma.ApprovalWorkflowInclude;

export type ApprovalWorkflowWithRelations = Prisma.ApprovalWorkflowGetPayload<{
  include: typeof approvalWorkflowInclude;
}>;

@Injectable()
export class ApprovalRepository {
  constructor(private readonly prisma: PrismaService) {}

  createWorkflow(
    data: Prisma.ApprovalWorkflowCreateInput,
  ): Promise<ApprovalWorkflowWithRelations> {
    return this.prisma.approvalWorkflow.create({
      data,
      include: approvalWorkflowInclude,
    });
  }

  findWorkflow(
    id: string,
    organisationId: string,
  ): Promise<ApprovalWorkflowWithRelations | null> {
    return this.prisma.approvalWorkflow.findFirst({
      where: {
        id,
        procurementRequest: { organisationId },
      },
      include: approvalWorkflowInclude,
    });
  }

  findWorkflowByRequestId(
    procurementRequestId: string,
    organisationId: string,
  ): Promise<ApprovalWorkflowWithRelations | null> {
    return this.prisma.approvalWorkflow.findFirst({
      where: {
        procurementRequestId,
        procurementRequest: { organisationId },
      },
      include: approvalWorkflowInclude,
    });
  }

  findCurrentStep(workflowId: string) {
    return this.prisma.approvalWorkflow.findUnique({
      where: { id: workflowId },
      include: {
        steps: {
          include: {
            approver: {
              select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                role: true,
              },
            },
          },
        },
      },
    });
  }

  approve(
    stepId: string,
    comments: string | undefined,
  ): Promise<ApprovalWorkflowWithRelations> {
    return this.prisma.$transaction(async (tx) => {
      const step = await tx.approvalStep.findUnique({
        where: { id: stepId },
        include: {
          workflow: {
            include: {
              procurementRequest: true,
            },
          },
        },
      });

      if (!step) {
        throw new Error('Approval step not found');
      }

      await tx.approvalStep.update({
        where: { id: stepId },
        data: {
          status: ApprovalStatus.APPROVED,
          comments,
          actedAt: new Date(),
        },
      });

      const workflow = step.workflow;
      const isFinalLevel = workflow.currentLevel >= MAX_APPROVAL_LEVEL;

      if (isFinalLevel) {
        await tx.approvalWorkflow.update({
          where: { id: workflow.id },
          data: { status: WorkflowStatus.APPROVED },
        });

        await tx.procurementRequest.update({
          where: { id: workflow.procurementRequestId },
          data: { status: ProcurementStatus.APPROVED },
        });
      } else {
        await tx.approvalWorkflow.update({
          where: { id: workflow.id },
          data: { currentLevel: workflow.currentLevel + 1 },
        });
      }

      return tx.approvalWorkflow.findUniqueOrThrow({
        where: { id: workflow.id },
        include: approvalWorkflowInclude,
      });
    });
  }

  reject(
    stepId: string,
    comments: string,
  ): Promise<ApprovalWorkflowWithRelations> {
    return this.prisma.$transaction(async (tx) => {
      const step = await tx.approvalStep.findUnique({
        where: { id: stepId },
        include: { workflow: true },
      });

      if (!step) {
        throw new Error('Approval step not found');
      }

      await tx.approvalStep.update({
        where: { id: stepId },
        data: {
          status: ApprovalStatus.REJECTED,
          comments,
          actedAt: new Date(),
        },
      });

      await tx.approvalStep.updateMany({
        where: {
          workflowId: step.workflowId,
          status: ApprovalStatus.PENDING,
          level: { gt: step.level },
        },
        data: { status: ApprovalStatus.SKIPPED },
      });

      await tx.approvalWorkflow.update({
        where: { id: step.workflowId },
        data: { status: WorkflowStatus.REJECTED },
      });

      await tx.procurementRequest.update({
        where: { id: step.workflow.procurementRequestId },
        data: { status: ProcurementStatus.REJECTED },
      });

      return tx.approvalWorkflow.findUniqueOrThrow({
        where: { id: step.workflowId },
        include: approvalWorkflowInclude,
      });
    });
  }

  findPendingApprovals(approverId: string, organisationId: string) {
    return this.prisma.approvalStep.findMany({
      where: {
        approverId,
        status: ApprovalStatus.PENDING,
        workflow: {
          status: WorkflowStatus.IN_PROGRESS,
          procurementRequest: { organisationId },
        },
      },
      include: {
        approver: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            role: true,
          },
        },
        workflow: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  history(
    procurementRequestId: string,
    organisationId: string,
  ): Promise<ApprovalWorkflowWithRelations | null> {
    return this.findWorkflowByRequestId(procurementRequestId, organisationId);
  }
}
