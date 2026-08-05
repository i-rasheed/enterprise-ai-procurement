import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  ApprovalStatus,
  ProcurementStatus,
  Role,
  WorkflowStatus,
} from '@prisma/client';

import { AuditService } from '../audit/audit.service';
import { ProcurementRepository } from '../procurement/procurement.repository';
import { UserRepository } from '../users/user.repository';
import {
  ApprovalRepository,
  ApprovalWorkflowWithRelations,
} from './approval.repository';
import { ApproveRequestDto } from './dto/approve-request.dto';
import { RejectRequestDto } from './dto/reject-request.dto';
import {
  APPROVAL_LEVELS,
  MAX_APPROVAL_LEVEL,
} from './constants/approval-levels.constants';

@Injectable()
export class ApprovalWorkflowService {
  constructor(
    private readonly approvalRepository: ApprovalRepository,
    private readonly procurementRepository: ProcurementRepository,
    private readonly userRepository: UserRepository,
    private readonly auditService: AuditService,
  ) {}

  async startWorkflow(organisationId: string, requestId: string) {
    const request = await this.procurementRepository.findById(
      requestId,
      organisationId,
    );

    if (!request) {
      throw new NotFoundException('Procurement request not found');
    }

    if (request.status !== ProcurementStatus.SUBMITTED) {
      throw new BadRequestException(
        'Approval workflow can only start for submitted procurement requests',
      );
    }

    const existing = await this.approvalRepository.findWorkflowByRequestId(
      requestId,
      organisationId,
    );

    if (existing) {
      throw new ConflictException(
        'An approval workflow already exists for this procurement request',
      );
    }

    const steps = await Promise.all(
      APPROVAL_LEVELS.map(async (levelConfig) => {
        const approver = await this.resolveApprover(
          organisationId,
          levelConfig.assignableRoles,
        );

        return {
          level: levelConfig.level,
          role: levelConfig.role,
          approver: { connect: { id: approver.id } },
        };
      }),
    );

    const workflow = await this.approvalRepository.createWorkflow({
      currentLevel: 1,
      status: WorkflowStatus.IN_PROGRESS,
      procurementRequest: { connect: { id: requestId } },
      steps: { create: steps },
    });

    return this.mapWorkflow(workflow);
  }

  async approveStep(
    organisationId: string,
    userId: string,
    userRole: Role,
    workflowId: string,
    dto: ApproveRequestDto,
  ) {
    const workflow = await this.getWorkflowOrThrow(workflowId, organisationId);
    const currentStep = this.getCurrentStepOrThrow(workflow);

    this.assertCanAct(userId, userRole, currentStep.approverId);

    if (currentStep.status !== ApprovalStatus.PENDING) {
      throw new BadRequestException('Current approval step is not pending');
    }

    const updated = await this.approvalRepository.approve(
      currentStep.id,
      dto.comments,
    );

    await this.auditService.logBusiness('APPROVAL_APPROVED', {
      organisationId,
      userId,
      entityType: 'ApprovalWorkflow',
      entityId: workflowId,
      metadata: {
        procurementRequestId: workflow.procurementRequestId,
        level: currentStep.level,
        comments: dto.comments,
      },
    });

    return this.mapWorkflow(updated);
  }

  async rejectStep(
    organisationId: string,
    userId: string,
    userRole: Role,
    workflowId: string,
    dto: RejectRequestDto,
  ) {
    const workflow = await this.getWorkflowOrThrow(workflowId, organisationId);
    const currentStep = this.getCurrentStepOrThrow(workflow);

    this.assertCanAct(userId, userRole, currentStep.approverId);

    if (currentStep.status !== ApprovalStatus.PENDING) {
      throw new BadRequestException('Current approval step is not pending');
    }

    const updated = await this.approvalRepository.reject(
      currentStep.id,
      dto.comments,
    );

    await this.auditService.logBusiness('APPROVAL_REJECTED', {
      organisationId,
      userId,
      entityType: 'ApprovalWorkflow',
      entityId: workflowId,
      metadata: {
        procurementRequestId: workflow.procurementRequestId,
        level: currentStep.level,
        comments: dto.comments,
      },
    });

    return this.mapWorkflow(updated);
  }

  async getWorkflow(organisationId: string, workflowId: string) {
    const workflow = await this.approvalRepository.findWorkflow(
      workflowId,
      organisationId,
    );

    if (!workflow) {
      throw new NotFoundException('Approval workflow not found');
    }

    return this.mapWorkflow(workflow);
  }

  async getPendingApprovals(organisationId: string, approverId: string) {
    const steps = await this.approvalRepository.findPendingApprovals(
      approverId,
      organisationId,
    );

    const actionable = steps.filter(
      (step) => step.level === step.workflow.currentLevel,
    );

    return {
      pendingApprovals: actionable.map((step) => ({
        ...this.mapStep(step),
        procurementRequest: step.workflow.procurementRequest
          ? {
              id: step.workflow.procurementRequest.id,
              title: step.workflow.procurementRequest.title,
              department: step.workflow.procurementRequest.department,
              estimatedBudget: Number(
                step.workflow.procurementRequest.estimatedBudget,
              ),
              currency: step.workflow.procurementRequest.currency,
              priority: step.workflow.procurementRequest.priority,
              status: step.workflow.procurementRequest.status,
              requester: step.workflow.procurementRequest.requester,
            }
          : null,
      })),
    };
  }

  async getHistory(organisationId: string, requestId: string) {
    const request = await this.procurementRepository.findById(
      requestId,
      organisationId,
    );

    if (!request) {
      throw new NotFoundException('Procurement request not found');
    }

    const workflow = await this.approvalRepository.history(
      requestId,
      organisationId,
    );

    return {
      procurementRequestId: requestId,
      workflow: workflow ? this.mapWorkflow(workflow) : null,
    };
  }

  private async getWorkflowOrThrow(workflowId: string, organisationId: string) {
    const workflow = await this.approvalRepository.findWorkflow(
      workflowId,
      organisationId,
    );

    if (!workflow) {
      throw new NotFoundException('Approval workflow not found');
    }

    if (workflow.status !== WorkflowStatus.IN_PROGRESS) {
      throw new BadRequestException('Approval workflow is no longer active');
    }

    return workflow;
  }

  private getCurrentStepOrThrow(workflow: ApprovalWorkflowWithRelations) {
    const currentStep = workflow.steps.find(
      (step) => step.level === workflow.currentLevel,
    );

    if (!currentStep) {
      throw new NotFoundException('Current approval step not found');
    }

    return currentStep;
  }

  private assertCanAct(userId: string, userRole: Role, approverId: string) {
    if (userId !== approverId && userRole !== Role.ADMIN) {
      throw new ForbiddenException(
        'Only the assigned approver or an admin can perform this action',
      );
    }
  }

  private async resolveApprover(organisationId: string, roles: Role[]) {
    for (const role of roles) {
      const approver = await this.userRepository.findFirstByOrganisationAndRole(
        organisationId,
        role,
      );

      if (approver) {
        return approver;
      }
    }

    throw new BadRequestException(
      `No approver found for roles: ${roles.join(', ')}`,
    );
  }

  private mapWorkflow(workflow: ApprovalWorkflowWithRelations) {
    return {
      id: workflow.id,
      procurementRequestId: workflow.procurementRequestId,
      currentLevel: workflow.currentLevel,
      status: workflow.status,
      steps: workflow.steps.map((step) => this.mapStep(step)),
      createdAt: workflow.createdAt.toISOString(),
      updatedAt: workflow.updatedAt.toISOString(),
    };
  }

  private mapStep(
    step:
      | ApprovalWorkflowWithRelations['steps'][number]
      | {
          id: string;
          workflowId: string;
          approver: ApprovalWorkflowWithRelations['steps'][number]['approver'];
          role: ApprovalWorkflowWithRelations['steps'][number]['role'];
          level: number;
          status: ApprovalStatus;
          comments: string | null;
          actedAt: Date | null;
          createdAt: Date;
          updatedAt: Date;
        },
  ) {
    return {
      id: step.id,
      workflowId: step.workflowId,
      approver: step.approver,
      role: step.role,
      level: step.level,
      status: step.status,
      comments: step.comments,
      actedAt: step.actedAt?.toISOString() ?? null,
      createdAt: step.createdAt.toISOString(),
      updatedAt: step.updatedAt.toISOString(),
    };
  }
}

export { MAX_APPROVAL_LEVEL };
