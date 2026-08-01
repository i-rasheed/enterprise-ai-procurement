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
} from '@nestjs/swagger';

import { CurrentUser } from '../auth/decorators/current-user/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt/jwt.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { TenantGuard } from '../auth/guards/tenant.guard';
import {
  approveInvoiceRequestExample,
  createInvoiceRequestExample,
  deleteInvoiceResponseExample,
  invoiceResponseExample,
  markPaidRequestExample,
  matchInvoiceResponseExample,
  matchingResultResponseExample,
  paginatedInvoiceResponseExample,
  rejectInvoiceRequestExample,
  submitInvoiceRequestExample,
  updateInvoiceRequestExample,
} from '../common/swagger/swagger-examples';
import type { JwtPayload } from '../common/types/jwt-payload.interface';
import {
  INVOICE_APPROVE_ROLES,
  INVOICE_CREATE_ROLES,
  INVOICE_PAY_ROLES,
  INVOICE_VIEW_ROLES,
} from './constants/invoice-role.constants';
import { ApproveInvoiceDto } from './dto/approve-invoice.dto';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import {
  DeleteInvoiceResponseDto,
  InvoiceResponseDto,
  MatchInvoiceResponseDto,
  MatchingResultResponseDto,
  PaginatedInvoiceResponseDto,
} from './dto/invoice-response.dto';
import { ListInvoiceQueryDto } from './dto/list-invoice-query.dto';
import { MarkPaidDto } from './dto/mark-paid.dto';
import { RejectInvoiceDto } from './dto/reject-invoice.dto';
import { SubmitInvoiceDto } from './dto/submit-invoice.dto';
import { UpdateInvoiceDto } from './dto/update-invoice.dto';
import { InvoicesService } from './invoices.service';

@ApiTags('invoices')
@ApiBearerAuth('JWT-auth')
@Controller('invoices')
@UseGuards(JwtAuthGuard, TenantGuard)
export class InvoicesController {
  constructor(private readonly invoicesService: InvoicesService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles(...INVOICE_CREATE_ROLES)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create draft invoice',
    description:
      'Creates a draft invoice linked to a purchase order and goods receipt.',
  })
  @ApiBody({
    type: CreateInvoiceDto,
    examples: {
      default: {
        summary: 'Create vendor invoice',
        value: createInvoiceRequestExample,
      },
    },
  })
  @ApiCreatedResponse({
    description: 'Draft invoice created',
    type: InvoiceResponseDto,
    schema: { example: invoiceResponseExample },
  })
  @ApiBadRequestResponse({ description: 'Invalid invoice data or references' })
  create(@CurrentUser() user: JwtPayload, @Body() dto: CreateInvoiceDto) {
    return this.invoicesService.create(
      user.organisationId!,
      user.email,
      user.role,
      dto,
    );
  }

  @Get()
  @UseGuards(RolesGuard)
  @Roles(...INVOICE_VIEW_ROLES)
  @ApiOperation({
    summary: 'List invoices',
    description: 'Returns paginated invoices with optional search.',
  })
  @ApiOkResponse({
    description: 'Paginated invoice list',
    type: PaginatedInvoiceResponseDto,
    schema: { example: paginatedInvoiceResponseExample },
  })
  findAll(
    @CurrentUser() user: JwtPayload,
    @Query() query: ListInvoiceQueryDto,
  ) {
    return this.invoicesService.findAll(
      user.organisationId!,
      user.email,
      user.role,
      query,
    );
  }

  @Get(':id')
  @UseGuards(RolesGuard)
  @Roles(...INVOICE_VIEW_ROLES)
  @ApiOperation({ summary: 'Get invoice by ID' })
  @ApiOkResponse({
    description: 'Invoice details',
    type: InvoiceResponseDto,
    schema: { example: invoiceResponseExample },
  })
  @ApiNotFoundResponse({ description: 'Invoice not found' })
  @ApiForbiddenResponse({ description: 'Insufficient permissions' })
  findOne(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.invoicesService.findOne(
      user.organisationId!,
      user.email,
      user.role,
      id,
    );
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles(...INVOICE_CREATE_ROLES)
  @ApiOperation({
    summary: 'Update draft invoice',
    description: 'Only draft invoices can be updated.',
  })
  @ApiBody({
    type: UpdateInvoiceDto,
    examples: {
      default: {
        summary: 'Update invoice details',
        value: updateInvoiceRequestExample,
      },
    },
  })
  @ApiOkResponse({
    description: 'Invoice updated',
    type: InvoiceResponseDto,
    schema: { example: invoiceResponseExample },
  })
  update(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Body() dto: UpdateInvoiceDto,
  ) {
    return this.invoicesService.update(
      user.organisationId!,
      user.email,
      user.role,
      id,
      dto,
    );
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(...INVOICE_CREATE_ROLES)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Delete draft invoice',
    description: 'Only draft invoices can be deleted.',
  })
  @ApiOkResponse({
    description: 'Invoice deleted',
    type: DeleteInvoiceResponseDto,
    schema: { example: deleteInvoiceResponseExample },
  })
  delete(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.invoicesService.delete(
      user.organisationId!,
      user.email,
      user.role,
      id,
    );
  }

  @Post(':id/submit')
  @UseGuards(RolesGuard)
  @Roles(...INVOICE_CREATE_ROLES)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Submit invoice',
    description: 'Submits a draft invoice for three-way matching.',
  })
  @ApiBody({
    type: SubmitInvoiceDto,
    examples: {
      default: {
        summary: 'Submit for matching',
        value: submitInvoiceRequestExample,
      },
    },
  })
  @ApiOkResponse({
    description: 'Invoice submitted',
    type: InvoiceResponseDto,
    schema: { example: { ...invoiceResponseExample, status: 'SUBMITTED' } },
  })
  submit(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Body() dto: SubmitInvoiceDto,
  ) {
    return this.invoicesService.submit(
      user.organisationId!,
      user.email,
      user.role,
      id,
      dto,
    );
  }

  @Post(':id/match')
  @UseGuards(RolesGuard)
  @Roles(...INVOICE_APPROVE_ROLES)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Run three-way matching',
    description:
      'Matches invoice against purchase order and goods receipt. Finance and admins only.',
  })
  @ApiOkResponse({
    description: 'Matching result',
    type: MatchInvoiceResponseDto,
    schema: { example: matchInvoiceResponseExample },
  })
  @ApiBadRequestResponse({
    description: 'Only submitted invoices can be matched',
  })
  match(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.invoicesService.match(
      user.organisationId!,
      user.role,
      user.sub,
      id,
    );
  }

  @Post(':id/approve')
  @UseGuards(RolesGuard)
  @Roles(...INVOICE_APPROVE_ROLES)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Approve invoice',
    description: 'Approves a matched invoice for payment eligibility.',
  })
  @ApiBody({
    type: ApproveInvoiceDto,
    examples: {
      default: {
        summary: 'Approve matched invoice',
        value: approveInvoiceRequestExample,
      },
    },
  })
  @ApiOkResponse({
    description: 'Invoice approved',
    type: InvoiceResponseDto,
    schema: { example: { ...invoiceResponseExample, status: 'APPROVED' } },
  })
  approve(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Body() dto: ApproveInvoiceDto,
  ) {
    return this.invoicesService.approve(
      user.organisationId!,
      user.role,
      id,
      dto,
    );
  }

  @Post(':id/reject')
  @UseGuards(RolesGuard)
  @Roles(...INVOICE_APPROVE_ROLES)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Reject invoice' })
  @ApiBody({
    type: RejectInvoiceDto,
    examples: {
      default: {
        summary: 'Reject invoice',
        value: rejectInvoiceRequestExample,
      },
    },
  })
  @ApiOkResponse({
    description: 'Invoice rejected',
    type: InvoiceResponseDto,
    schema: { example: { ...invoiceResponseExample, status: 'REJECTED' } },
  })
  reject(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Body() dto: RejectInvoiceDto,
  ) {
    return this.invoicesService.reject(
      user.organisationId!,
      user.role,
      id,
      dto,
    );
  }

  @Post(':id/pay')
  @UseGuards(RolesGuard)
  @Roles(...INVOICE_PAY_ROLES)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Mark invoice as paid',
    description: 'Marks an approved invoice as paid. Finance and admins only.',
  })
  @ApiBody({
    type: MarkPaidDto,
    examples: {
      default: {
        summary: 'Record payment',
        value: markPaidRequestExample,
      },
    },
  })
  @ApiOkResponse({
    description: 'Invoice marked as paid',
    type: InvoiceResponseDto,
    schema: { example: { ...invoiceResponseExample, status: 'PAID' } },
  })
  markPaid(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Body() dto: MarkPaidDto,
  ) {
    return this.invoicesService.markPaid(
      user.organisationId!,
      user.role,
      id,
      dto,
    );
  }
}

@ApiTags('matching-results')
@ApiBearerAuth('JWT-auth')
@Controller('matching-results')
@UseGuards(JwtAuthGuard, TenantGuard, RolesGuard)
@Roles(...INVOICE_VIEW_ROLES)
export class MatchingResultsController {
  constructor(private readonly invoicesService: InvoicesService) {}

  @Get(':invoiceId')
  @ApiOperation({ summary: 'Get matching result for an invoice' })
  @ApiOkResponse({
    description: 'Matching result details',
    type: MatchingResultResponseDto,
    schema: { example: matchingResultResponseExample },
  })
  @ApiNotFoundResponse({ description: 'Matching result not found' })
  findByInvoice(
    @CurrentUser() user: JwtPayload,
    @Param('invoiceId') invoiceId: string,
  ) {
    return this.invoicesService.getMatchingResult(
      user.organisationId!,
      user.role,
      invoiceId,
    );
  }
}
