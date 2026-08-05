import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
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
  createProcurementItemRequestExample,
  createProcurementRequestExample,
  deleteProcurementItemResponseExample,
  deleteProcurementResponseExample,
  paginatedProcurementResponseExample,
  procurementRequestResponseExample,
  submitProcurementRequestExample,
  updateProcurementRequestExample,
} from '../common/swagger/swagger-examples';
import type { JwtPayload } from '../common/types/jwt-payload.interface';
import { CreateProcurementItemDto } from './dto/create-procurement-item.dto';
import { CreateProcurementRequestDto } from './dto/create-procurement-request.dto';
import { ListProcurementQueryDto } from './dto/list-procurement-query.dto';
import {
  DeleteProcurementItemResponseDto,
  DeleteProcurementResponseDto,
  PaginatedProcurementResponseDto,
  ProcurementRequestResponseDto,
  SubmitProcurementResponseDto,
} from './dto/procurement-response.dto';
import { SubmitProcurementRequestDto } from './dto/submit-procurement-request.dto';
import { UpdateProcurementRequestDto } from './dto/update-procurement-request.dto';
import { ProcurementService } from './procurement.service';

@ApiTags('procurement-requests')
@ApiBearerAuth('JWT-auth')
@Controller('procurement-requests')
@UseGuards(JwtAuthGuard, TenantGuard)
export class ProcurementController {
  constructor(private readonly procurementService: ProcurementService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create procurement request draft',
    description:
      'Creates a draft procurement request for the authenticated user in their organisation.',
  })
  @ApiBody({
    type: CreateProcurementRequestDto,
    examples: {
      default: {
        summary: 'Office furniture request',
        value: createProcurementRequestExample,
      },
    },
  })
  @ApiCreatedResponse({
    description: 'Draft procurement request created',
    type: ProcurementRequestResponseDto,
    schema: { example: procurementRequestResponseExample },
  })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid JWT' })
  @ApiForbiddenResponse({ description: 'Missing tenant context in JWT' })
  create(
    @CurrentUser() user: JwtPayload,
    @Body() dto: CreateProcurementRequestDto,
  ) {
    return this.procurementService.createDraft(
      user.organisationId!,
      user.sub,
      dto,
    );
  }

  @Get()
  @ApiOperation({
    summary: 'List procurement requests',
    description:
      'Returns paginated procurement requests with optional status, priority, department, and search filters.',
  })
  @ApiOkResponse({
    description: 'Paginated procurement request list',
    type: PaginatedProcurementResponseDto,
    schema: { example: paginatedProcurementResponseExample },
  })
  findAll(
    @CurrentUser() user: JwtPayload,
    @Query() query: ListProcurementQueryDto,
  ) {
    return this.procurementService.findAll(user.organisationId!, query);
  }

  @Delete('items/:itemId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Remove line item',
    description:
      'Removes a line item from a draft procurement request. Submitted requests are read-only.',
  })
  @ApiOkResponse({
    description: 'Line item removed',
    type: DeleteProcurementItemResponseDto,
    schema: { example: deleteProcurementItemResponseExample },
  })
  @ApiNotFoundResponse({ description: 'Line item not found' })
  @ApiBadRequestResponse({
    description: 'Request is not in draft status',
  })
  @ApiForbiddenResponse({
    description: 'Line item does not belong to your organisation',
  })
  removeLineItem(
    @CurrentUser() user: JwtPayload,
    @Param('itemId') itemId: string,
  ) {
    return this.procurementService.removeLineItem(user.organisationId!, itemId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get procurement request by ID' })
  @ApiOkResponse({
    description: 'Procurement request details',
    type: ProcurementRequestResponseDto,
    schema: { example: procurementRequestResponseExample },
  })
  @ApiNotFoundResponse({ description: 'Procurement request not found' })
  findOne(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.procurementService.findOne(user.organisationId!, id);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Update procurement request draft',
    description: 'Updates a draft request. Submitted requests are read-only.',
  })
  @ApiBody({
    type: UpdateProcurementRequestDto,
    examples: {
      default: {
        summary: 'Update priority and budget',
        value: updateProcurementRequestExample,
      },
    },
  })
  @ApiOkResponse({
    description: 'Draft procurement request updated',
    type: ProcurementRequestResponseDto,
    schema: { example: procurementRequestResponseExample },
  })
  @ApiBadRequestResponse({
    description: 'Request is not in draft status',
  })
  @ApiNotFoundResponse({ description: 'Procurement request not found' })
  update(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Body() dto: UpdateProcurementRequestDto,
  ) {
    return this.procurementService.updateDraft(user.organisationId!, id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Delete procurement request draft',
    description: 'Permanently deletes a draft procurement request.',
  })
  @ApiOkResponse({
    description: 'Procurement request deleted',
    type: DeleteProcurementResponseDto,
    schema: { example: deleteProcurementResponseExample },
  })
  @ApiBadRequestResponse({
    description: 'Request is not in draft status',
  })
  @ApiNotFoundResponse({ description: 'Procurement request not found' })
  delete(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.procurementService.deleteDraft(user.organisationId!, id);
  }

  @Post(':id/submit')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Submit procurement request',
    description:
      'Submits a draft request for review. Requires at least one line item and matching budget total.',
  })
  @ApiBody({
    type: SubmitProcurementRequestDto,
    examples: {
      default: {
        summary: 'Submit with note',
        value: submitProcurementRequestExample,
      },
    },
  })
  @ApiOkResponse({
    description: 'Procurement request submitted',
    type: SubmitProcurementResponseDto,
    schema: {
      example: {
        ...procurementRequestResponseExample,
        status: 'SUBMITTED',
        submissionNote: 'Ready for procurement review.',
      },
    },
  })
  @ApiBadRequestResponse({
    description:
      'Missing line items, budget mismatch, or request is not in draft status',
  })
  @ApiNotFoundResponse({ description: 'Procurement request not found' })
  submit(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Body() dto: SubmitProcurementRequestDto,
  ) {
    return this.procurementService.submit(user.organisationId!, id, dto);
  }

  @Post(':id/items')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Add line item',
    description:
      'Adds a line item to a draft request. Total price is calculated as quantity × unit price.',
  })
  @ApiBody({
    type: CreateProcurementItemDto,
    examples: {
      default: {
        summary: 'Add office chairs',
        value: createProcurementItemRequestExample,
      },
    },
  })
  @ApiCreatedResponse({
    description: 'Line item added',
    type: ProcurementRequestResponseDto,
    schema: { example: procurementRequestResponseExample },
  })
  @ApiBadRequestResponse({
    description: 'Request is not in draft status',
  })
  @ApiNotFoundResponse({ description: 'Procurement request not found' })
  addLineItem(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Body() dto: CreateProcurementItemDto,
  ) {
    return this.procurementService.addLineItem(user.organisationId!, id, dto);
  }
}
