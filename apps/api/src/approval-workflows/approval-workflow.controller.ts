import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

import { CurrentUser } from '../auth/decorators/current-user/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt/jwt.guard';
import { TenantGuard } from '../auth/guards/tenant.guard';
import {
  approvalHistoryResponseExample,
  approvalWorkflowResponseExample,
  approveRequestExample,
  pendingApprovalsResponseExample,
  rejectRequestExample,
} from '../common/swagger/swagger-examples';
import type { JwtPayload } from '../common/types/jwt-payload.interface';
import { ApprovalWorkflowService } from './approval-workflow.service';
import { ApproveRequestDto } from './dto/approve-request.dto';
import {
  ApprovalHistoryResponseDto,
  ApprovalWorkflowResponseDto,
  PendingApprovalsResponseDto,
} from './dto/approval-workflow-response.dto';
import { RejectRequestDto } from './dto/reject-request.dto';

@ApiTags('approval-workflows')
@ApiBearerAuth('JWT-auth')
@Controller('approval-workflows')
@UseGuards(JwtAuthGuard, TenantGuard)
export class ApprovalWorkflowController {
  constructor(
    private readonly approvalWorkflowService: ApprovalWorkflowService,
  ) {}

  @Get('pending')
  @ApiOperation({
    summary: 'List pending approvals',
    description:
      'Returns approval steps assigned to the authenticated user at the current workflow level.',
  })
  @ApiOkResponse({
    description: 'Pending approvals for the current user',
    type: PendingApprovalsResponseDto,
    schema: { example: pendingApprovalsResponseExample },
  })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid JWT' })
  getPendingApprovals(@CurrentUser() user: JwtPayload) {
    return this.approvalWorkflowService.getPendingApprovals(
      user.organisationId!,
      user.sub,
    );
  }

  @Get('history/:requestId')
  @ApiOperation({
    summary: 'Get approval history',
    description:
      'Returns the approval workflow and step history for a procurement request.',
  })
  @ApiOkResponse({
    description: 'Approval workflow history',
    type: ApprovalHistoryResponseDto,
    schema: { example: approvalHistoryResponseExample },
  })
  @ApiNotFoundResponse({ description: 'Procurement request not found' })
  getHistory(
    @CurrentUser() user: JwtPayload,
    @Param('requestId') requestId: string,
  ) {
    return this.approvalWorkflowService.getHistory(
      user.organisationId!,
      requestId,
    );
  }

  @Post(':requestId/start')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Start approval workflow',
    description:
      'Creates a multi-level approval workflow for a submitted procurement request.',
  })
  @ApiCreatedResponse({
    description: 'Approval workflow started',
    type: ApprovalWorkflowResponseDto,
    schema: { example: approvalWorkflowResponseExample },
  })
  @ApiBadRequestResponse({
    description: 'Request is not submitted or approvers are missing',
  })
  @ApiConflictResponse({
    description: 'Workflow already exists for this request',
  })
  @ApiNotFoundResponse({ description: 'Procurement request not found' })
  startWorkflow(
    @CurrentUser() user: JwtPayload,
    @Param('requestId') requestId: string,
  ) {
    return this.approvalWorkflowService.startWorkflow(
      user.organisationId!,
      requestId,
    );
  }

  @Get(':workflowId')
  @ApiOperation({ summary: 'Get approval workflow by ID' })
  @ApiOkResponse({
    description: 'Approval workflow details',
    type: ApprovalWorkflowResponseDto,
    schema: { example: approvalWorkflowResponseExample },
  })
  @ApiNotFoundResponse({ description: 'Approval workflow not found' })
  getWorkflow(
    @CurrentUser() user: JwtPayload,
    @Param('workflowId') workflowId: string,
  ) {
    return this.approvalWorkflowService.getWorkflow(
      user.organisationId!,
      workflowId,
    );
  }

  @Post(':workflowId/approve')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Approve current workflow step',
    description:
      'Approves the current level. Only the assigned approver or an admin may approve.',
  })
  @ApiBody({
    type: ApproveRequestDto,
    examples: {
      default: {
        summary: 'Approve with comments',
        value: approveRequestExample,
      },
    },
  })
  @ApiOkResponse({
    description: 'Step approved and workflow advanced',
    type: ApprovalWorkflowResponseDto,
    schema: { example: approvalWorkflowResponseExample },
  })
  @ApiForbiddenResponse({
    description: 'User is not the assigned approver or an admin',
  })
  @ApiBadRequestResponse({
    description: 'Workflow is inactive or step is not pending',
  })
  @ApiNotFoundResponse({ description: 'Approval workflow not found' })
  approve(
    @CurrentUser() user: JwtPayload,
    @Param('workflowId') workflowId: string,
    @Body() dto: ApproveRequestDto,
  ) {
    return this.approvalWorkflowService.approveStep(
      user.organisationId!,
      user.sub,
      user.role,
      workflowId,
      dto,
    );
  }

  @Post(':workflowId/reject')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Reject current workflow step',
    description:
      'Rejects the current level and terminates the workflow. Rejection comments are required.',
  })
  @ApiBody({
    type: RejectRequestDto,
    examples: {
      default: {
        summary: 'Reject with reason',
        value: rejectRequestExample,
      },
    },
  })
  @ApiOkResponse({
    description: 'Step rejected and workflow terminated',
    type: ApprovalWorkflowResponseDto,
  })
  @ApiForbiddenResponse({
    description: 'User is not the assigned approver or an admin',
  })
  @ApiBadRequestResponse({
    description: 'Workflow is inactive or step is not pending',
  })
  @ApiNotFoundResponse({ description: 'Approval workflow not found' })
  reject(
    @CurrentUser() user: JwtPayload,
    @Param('workflowId') workflowId: string,
    @Body() dto: RejectRequestDto,
  ) {
    return this.approvalWorkflowService.rejectStep(
      user.organisationId!,
      user.sub,
      user.role,
      workflowId,
      dto,
    );
  }
}
