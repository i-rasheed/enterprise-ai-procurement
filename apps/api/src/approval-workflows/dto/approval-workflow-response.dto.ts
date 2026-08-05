import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  ApprovalLevelRole,
  ApprovalStatus,
  Role,
  WorkflowStatus,
} from '@prisma/client';

export class ApprovalStepApproverDto {
  @ApiProperty({ example: 'clx123abc456def' })
  id: string;

  @ApiProperty({ example: 'admin@acme.com' })
  email: string;

  @ApiProperty({ example: 'Jane' })
  firstName: string;

  @ApiProperty({ example: 'Doe' })
  lastName: string;

  @ApiProperty({ enum: Role, example: Role.ADMIN })
  role: Role;
}

export class ApprovalStepResponseDto {
  @ApiProperty({ example: 'clxstep123' })
  id: string;

  @ApiProperty({ example: 'clxworkflow123' })
  workflowId: string;

  @ApiProperty({ type: ApprovalStepApproverDto })
  approver: ApprovalStepApproverDto;

  @ApiProperty({
    enum: ApprovalLevelRole,
    example: ApprovalLevelRole.DEPARTMENT_HEAD,
  })
  role: ApprovalLevelRole;

  @ApiProperty({ example: 1 })
  level: number;

  @ApiProperty({ enum: ApprovalStatus, example: ApprovalStatus.PENDING })
  status: ApprovalStatus;

  @ApiPropertyOptional({ example: 'Approved within budget.' })
  comments?: string | null;

  @ApiPropertyOptional({ example: '2026-08-01T12:00:00.000Z' })
  actedAt?: string | null;

  @ApiProperty({ example: '2026-08-01T10:00:00.000Z' })
  createdAt: string;

  @ApiProperty({ example: '2026-08-01T10:00:00.000Z' })
  updatedAt: string;
}

export class ApprovalWorkflowResponseDto {
  @ApiProperty({ example: 'clxworkflow123' })
  id: string;

  @ApiProperty({ example: 'clxprocurement123' })
  procurementRequestId: string;

  @ApiProperty({ example: 1 })
  currentLevel: number;

  @ApiProperty({ enum: WorkflowStatus, example: WorkflowStatus.IN_PROGRESS })
  status: WorkflowStatus;

  @ApiProperty({ type: [ApprovalStepResponseDto] })
  steps: ApprovalStepResponseDto[];

  @ApiProperty({ example: '2026-08-01T10:00:00.000Z' })
  createdAt: string;

  @ApiProperty({ example: '2026-08-01T10:00:00.000Z' })
  updatedAt: string;
}

export class PendingApprovalsResponseDto {
  @ApiProperty({ type: [ApprovalStepResponseDto] })
  pendingApprovals: ApprovalStepResponseDto[];
}

export class ApprovalHistoryResponseDto {
  @ApiProperty({ example: 'clxprocurement123' })
  procurementRequestId: string;

  @ApiProperty({ type: ApprovalWorkflowResponseDto, nullable: true })
  workflow: ApprovalWorkflowResponseDto | null;
}
