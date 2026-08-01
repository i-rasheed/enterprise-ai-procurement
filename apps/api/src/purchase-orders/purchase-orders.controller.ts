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
  ApiConflictResponse,
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
  acknowledgePurchaseOrderRequestExample,
  cancelPurchaseOrderResponseExample,
  createPurchaseOrderRequestExample,
  deletePurchaseOrderResponseExample,
  issuePurchaseOrderRequestExample,
  paginatedPurchaseOrderResponseExample,
  purchaseOrderResponseExample,
  updatePurchaseOrderRequestExample,
} from '../common/swagger/swagger-examples';
import type { JwtPayload } from '../common/types/jwt-payload.interface';
import { PO_MANAGEMENT_ROLES } from './constants/po-role.constants';
import { AcknowledgePurchaseOrderDto } from './dto/acknowledge-purchase-order.dto';
import { CreatePurchaseOrderDto } from './dto/create-purchase-order.dto';
import { IssuePurchaseOrderDto } from './dto/issue-purchase-order.dto';
import { ListPurchaseOrderQueryDto } from './dto/list-purchase-order-query.dto';
import {
  CancelPurchaseOrderResponseDto,
  DeletePurchaseOrderResponseDto,
  PaginatedPurchaseOrderResponseDto,
  PurchaseOrderListResponseDto,
  PurchaseOrderResponseDto,
} from './dto/purchase-order-response.dto';
import { UpdatePurchaseOrderDto } from './dto/update-purchase-order.dto';
import { PurchaseOrdersService } from './purchase-orders.service';

@ApiTags('purchase-orders')
@ApiBearerAuth('JWT-auth')
@Controller('purchase-orders')
@UseGuards(JwtAuthGuard, TenantGuard)
export class PurchaseOrdersController {
  constructor(private readonly purchaseOrdersService: PurchaseOrdersService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles(...PO_MANAGEMENT_ROLES)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create draft purchase order',
    description:
      'Creates a draft purchase order from an awarded bid. Admins, procurement managers, and finance only.',
  })
  @ApiBody({
    type: CreatePurchaseOrderDto,
    examples: {
      default: {
        summary: 'Create PO from award',
        value: createPurchaseOrderRequestExample,
      },
    },
  })
  @ApiCreatedResponse({
    description: 'Draft purchase order created',
    type: PurchaseOrderResponseDto,
    schema: { example: purchaseOrderResponseExample },
  })
  @ApiBadRequestResponse({ description: 'Award is not from an awarded bid' })
  @ApiConflictResponse({
    description: 'An active purchase order already exists for this award',
  })
  @ApiForbiddenResponse({ description: 'Insufficient permissions' })
  create(@CurrentUser() user: JwtPayload, @Body() dto: CreatePurchaseOrderDto) {
    return this.purchaseOrdersService.create(
      user.organisationId!,
      user.sub,
      dto,
    );
  }

  @Get()
  @UseGuards(RolesGuard)
  @Roles(...PO_MANAGEMENT_ROLES)
  @ApiOperation({
    summary: 'List purchase orders',
    description: 'Returns paginated purchase orders with optional search.',
  })
  @ApiOkResponse({
    description: 'Paginated purchase order list',
    type: PaginatedPurchaseOrderResponseDto,
    schema: { example: paginatedPurchaseOrderResponseExample },
  })
  findAll(
    @CurrentUser() user: JwtPayload,
    @Query() query: ListPurchaseOrderQueryDto,
  ) {
    return this.purchaseOrdersService.findAll(
      user.organisationId!,
      user.role,
      query,
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get purchase order by ID' })
  @ApiOkResponse({
    description: 'Purchase order details',
    type: PurchaseOrderResponseDto,
    schema: { example: purchaseOrderResponseExample },
  })
  @ApiNotFoundResponse({ description: 'Purchase order not found' })
  @ApiForbiddenResponse({ description: 'Insufficient permissions' })
  findOne(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.purchaseOrdersService.findOne(
      user.organisationId!,
      user.email,
      user.role,
      id,
    );
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles(...PO_MANAGEMENT_ROLES)
  @ApiOperation({
    summary: 'Update draft purchase order',
    description: 'Only draft purchase orders can be updated.',
  })
  @ApiBody({
    type: UpdatePurchaseOrderDto,
    examples: {
      default: {
        summary: 'Update delivery details',
        value: updatePurchaseOrderRequestExample,
      },
    },
  })
  @ApiOkResponse({
    description: 'Purchase order updated',
    type: PurchaseOrderResponseDto,
    schema: { example: purchaseOrderResponseExample },
  })
  @ApiBadRequestResponse({
    description: 'Issued or cancelled purchase orders cannot be edited',
  })
  update(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Body() dto: UpdatePurchaseOrderDto,
  ) {
    return this.purchaseOrdersService.update(
      user.organisationId!,
      user.role,
      id,
      dto,
    );
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(...PO_MANAGEMENT_ROLES)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Delete draft purchase order',
    description: 'Only draft purchase orders can be deleted.',
  })
  @ApiOkResponse({
    description: 'Purchase order deleted',
    type: DeletePurchaseOrderResponseDto,
    schema: { example: deletePurchaseOrderResponseExample },
  })
  @ApiBadRequestResponse({
    description: 'Only draft purchase orders can be deleted',
  })
  delete(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.purchaseOrdersService.delete(
      user.organisationId!,
      user.role,
      id,
    );
  }

  @Post(':id/issue')
  @UseGuards(RolesGuard)
  @Roles(...PO_MANAGEMENT_ROLES)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Issue purchase order',
    description:
      'Issues a draft purchase order to the vendor. Issued purchase orders become read-only.',
  })
  @ApiBody({
    type: IssuePurchaseOrderDto,
    examples: {
      default: {
        summary: 'Issue PO to vendor',
        value: issuePurchaseOrderRequestExample,
      },
    },
  })
  @ApiOkResponse({
    description: 'Purchase order issued',
    type: PurchaseOrderResponseDto,
    schema: { example: { ...purchaseOrderResponseExample, status: 'ISSUED' } },
  })
  @ApiBadRequestResponse({
    description: 'Only draft purchase orders can be issued',
  })
  issue(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Body() dto: IssuePurchaseOrderDto,
  ) {
    return this.purchaseOrdersService.issue(
      user.organisationId!,
      user.role,
      id,
      dto,
    );
  }

  @Post(':id/acknowledge')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Vendor acknowledge purchase order',
    description:
      'Allows the assigned vendor representative to acknowledge an issued purchase order.',
  })
  @ApiBody({
    type: AcknowledgePurchaseOrderDto,
    examples: {
      default: {
        summary: 'Acknowledge PO',
        value: acknowledgePurchaseOrderRequestExample,
      },
    },
  })
  @ApiOkResponse({
    description: 'Purchase order acknowledged',
    type: PurchaseOrderResponseDto,
    schema: {
      example: { ...purchaseOrderResponseExample, status: 'ACKNOWLEDGED' },
    },
  })
  @ApiBadRequestResponse({
    description: 'Only issued purchase orders can be acknowledged',
  })
  @ApiForbiddenResponse({ description: 'Vendor representative only' })
  acknowledge(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Body() dto: AcknowledgePurchaseOrderDto,
  ) {
    return this.purchaseOrdersService.acknowledge(
      user.organisationId!,
      user.email,
      id,
      dto,
    );
  }

  @Post(':id/cancel')
  @UseGuards(RolesGuard)
  @Roles(...PO_MANAGEMENT_ROLES)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Cancel purchase order',
    description:
      'Cancels a purchase order. Cancelled purchase orders cannot be edited.',
  })
  @ApiOkResponse({
    description: 'Purchase order cancelled',
    type: CancelPurchaseOrderResponseDto,
    schema: { example: cancelPurchaseOrderResponseExample },
  })
  @ApiBadRequestResponse({
    description:
      'Completed or already cancelled purchase orders cannot be cancelled',
  })
  cancel(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.purchaseOrdersService.cancel(
      user.organisationId!,
      user.role,
      id,
    );
  }
}

@ApiTags('vendors')
@ApiBearerAuth('JWT-auth')
@Controller('vendors/:vendorId/purchase-orders')
@UseGuards(JwtAuthGuard, TenantGuard)
export class VendorPurchaseOrdersController {
  constructor(private readonly purchaseOrdersService: PurchaseOrdersService) {}

  @Get()
  @ApiOperation({
    summary: 'List purchase orders for a vendor',
    description:
      'Returns purchase orders for the specified vendor. Vendor representatives can only view their own vendor.',
  })
  @ApiOkResponse({
    description: 'Vendor purchase order list',
    type: PurchaseOrderListResponseDto,
    schema: {
      example: { purchaseOrders: [purchaseOrderResponseExample] },
    },
  })
  @ApiNotFoundResponse({ description: 'Vendor not found' })
  @ApiForbiddenResponse({ description: 'Insufficient permissions' })
  findByVendor(
    @CurrentUser() user: JwtPayload,
    @Param('vendorId') vendorId: string,
  ) {
    return this.purchaseOrdersService.findByVendor(
      user.organisationId!,
      user.email,
      user.role,
      vendorId,
    );
  }
}
