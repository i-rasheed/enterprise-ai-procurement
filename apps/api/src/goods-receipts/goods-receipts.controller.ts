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
  completeGoodsReceiptResponseExample,
  createGoodsReceiptRequestExample,
  deleteGoodsReceiptResponseExample,
  goodsReceiptResponseExample,
  paginatedGoodsReceiptResponseExample,
  receiveGoodsRequestExample,
  rejectGoodsRequestExample,
  updateGoodsReceiptRequestExample,
} from '../common/swagger/swagger-examples';
import type { JwtPayload } from '../common/types/jwt-payload.interface';
import {
  GRN_COMPLETE_ROLES,
  GRN_RECEIVE_ROLES,
  GRN_VIEW_ROLES,
} from './constants/grn-role.constants';
import { CreateGoodsReceiptDto } from './dto/create-goods-receipt.dto';
import {
  DeleteGoodsReceiptResponseDto,
  GoodsReceiptResponseDto,
  PaginatedGoodsReceiptResponseDto,
} from './dto/goods-receipt-response.dto';
import { ListGoodsReceiptQueryDto } from './dto/list-goods-receipt-query.dto';
import { ReceiveGoodsDto } from './dto/receive-goods.dto';
import { RejectGoodsDto } from './dto/reject-goods.dto';
import { UpdateGoodsReceiptDto } from './dto/update-goods-receipt.dto';
import { GoodsReceiptsService } from './goods-receipts.service';

@ApiTags('goods-receipts')
@ApiBearerAuth('JWT-auth')
@Controller('goods-receipts')
@UseGuards(JwtAuthGuard, TenantGuard)
export class GoodsReceiptsController {
  constructor(private readonly goodsReceiptsService: GoodsReceiptsService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles(...GRN_RECEIVE_ROLES)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create draft goods receipt',
    description:
      'Creates a goods receipt from an issued or acknowledged purchase order.',
  })
  @ApiBody({
    type: CreateGoodsReceiptDto,
    examples: {
      default: {
        summary: 'Create goods receipt',
        value: createGoodsReceiptRequestExample,
      },
    },
  })
  @ApiCreatedResponse({
    description: 'Draft goods receipt created',
    type: GoodsReceiptResponseDto,
    schema: { example: goodsReceiptResponseExample },
  })
  @ApiBadRequestResponse({
    description: 'Purchase order is not eligible for goods receipt',
  })
  @ApiForbiddenResponse({ description: 'Insufficient permissions' })
  create(@CurrentUser() user: JwtPayload, @Body() dto: CreateGoodsReceiptDto) {
    return this.goodsReceiptsService.create(
      user.organisationId!,
      user.sub,
      dto,
    );
  }

  @Get()
  @UseGuards(RolesGuard)
  @Roles(...GRN_VIEW_ROLES)
  @ApiOperation({
    summary: 'List goods receipts',
    description: 'Returns paginated goods receipts with optional search.',
  })
  @ApiOkResponse({
    description: 'Paginated goods receipt list',
    type: PaginatedGoodsReceiptResponseDto,
    schema: { example: paginatedGoodsReceiptResponseExample },
  })
  findAll(
    @CurrentUser() user: JwtPayload,
    @Query() query: ListGoodsReceiptQueryDto,
  ) {
    return this.goodsReceiptsService.findAll(
      user.organisationId!,
      user.role,
      query,
    );
  }

  @Get(':id')
  @UseGuards(RolesGuard)
  @Roles(...GRN_VIEW_ROLES)
  @ApiOperation({ summary: 'Get goods receipt by ID' })
  @ApiOkResponse({
    description: 'Goods receipt details',
    type: GoodsReceiptResponseDto,
    schema: { example: goodsReceiptResponseExample },
  })
  @ApiNotFoundResponse({ description: 'Goods receipt not found' })
  findOne(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.goodsReceiptsService.findOne(
      user.organisationId!,
      user.role,
      id,
    );
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles(...GRN_RECEIVE_ROLES)
  @ApiOperation({
    summary: 'Update draft goods receipt',
    description: 'Only draft goods receipts can be updated.',
  })
  @ApiBody({
    type: UpdateGoodsReceiptDto,
    examples: {
      default: {
        summary: 'Update receipt details',
        value: updateGoodsReceiptRequestExample,
      },
    },
  })
  @ApiOkResponse({
    description: 'Goods receipt updated',
    type: GoodsReceiptResponseDto,
    schema: { example: goodsReceiptResponseExample },
  })
  @ApiBadRequestResponse({ description: 'Only draft receipts can be updated' })
  update(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Body() dto: UpdateGoodsReceiptDto,
  ) {
    return this.goodsReceiptsService.update(
      user.organisationId!,
      user.role,
      id,
      dto,
    );
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(...GRN_RECEIVE_ROLES)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Delete draft goods receipt',
    description: 'Only draft goods receipts can be deleted.',
  })
  @ApiOkResponse({
    description: 'Goods receipt deleted',
    type: DeleteGoodsReceiptResponseDto,
    schema: { example: deleteGoodsReceiptResponseExample },
  })
  delete(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.goodsReceiptsService.delete(
      user.organisationId!,
      user.role,
      id,
    );
  }

  @Post(':id/receive')
  @UseGuards(RolesGuard)
  @Roles(...GRN_RECEIVE_ROLES)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Receive goods',
    description:
      'Records received quantities against a goods receipt. Supports partial deliveries.',
  })
  @ApiBody({
    type: ReceiveGoodsDto,
    examples: {
      default: {
        summary: 'Partial receipt',
        value: receiveGoodsRequestExample,
      },
    },
  })
  @ApiOkResponse({
    description: 'Goods received',
    type: GoodsReceiptResponseDto,
    schema: {
      example: {
        ...goodsReceiptResponseExample,
        status: 'PARTIALLY_RECEIVED',
      },
    },
  })
  @ApiBadRequestResponse({
    description: 'Received quantity exceeds ordered quantity',
  })
  receive(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Body() dto: ReceiveGoodsDto,
  ) {
    return this.goodsReceiptsService.receive(
      user.organisationId!,
      user.role,
      id,
      dto,
    );
  }

  @Post(':id/reject')
  @UseGuards(RolesGuard)
  @Roles(...GRN_RECEIVE_ROLES)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Reject goods',
    description:
      'Records rejected quantities with mandatory remarks for rejected items.',
  })
  @ApiBody({
    type: RejectGoodsDto,
    examples: {
      default: {
        summary: 'Reject damaged items',
        value: rejectGoodsRequestExample,
      },
    },
  })
  @ApiOkResponse({
    description: 'Goods rejected',
    type: GoodsReceiptResponseDto,
    schema: { example: goodsReceiptResponseExample },
  })
  @ApiBadRequestResponse({
    description: 'Rejected quantities must include remarks',
  })
  reject(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Body() dto: RejectGoodsDto,
  ) {
    return this.goodsReceiptsService.reject(
      user.organisationId!,
      user.role,
      id,
      dto,
    );
  }

  @Post(':id/complete')
  @UseGuards(RolesGuard)
  @Roles(...GRN_COMPLETE_ROLES)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Complete goods receipt',
    description:
      'Admins only. Finalizes a goods receipt after receiving goods.',
  })
  @ApiOkResponse({
    description: 'Goods receipt completed',
    type: GoodsReceiptResponseDto,
    schema: { example: completeGoodsReceiptResponseExample },
  })
  @ApiForbiddenResponse({ description: 'Admins only' })
  @ApiBadRequestResponse({
    description: 'Receipt must have progress before completion',
  })
  complete(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.goodsReceiptsService.complete(
      user.organisationId!,
      user.role,
      id,
    );
  }
}

@ApiTags('purchase-orders')
@ApiBearerAuth('JWT-auth')
@Controller('purchase-orders/:purchaseOrderId/goods-receipts')
@UseGuards(JwtAuthGuard, TenantGuard, RolesGuard)
@Roles(...GRN_VIEW_ROLES)
export class PurchaseOrderGoodsReceiptsController {
  constructor(private readonly goodsReceiptsService: GoodsReceiptsService) {}

  @Get()
  @ApiOperation({
    summary: 'List goods receipts for a purchase order',
    description: 'Returns all goods receipts linked to the purchase order.',
  })
  @ApiOkResponse({
    description: 'Purchase order goods receipts',
    schema: {
      example: { goodsReceipts: [goodsReceiptResponseExample] },
    },
  })
  @ApiNotFoundResponse({ description: 'Purchase order not found' })
  findByPurchaseOrder(
    @CurrentUser() user: JwtPayload,
    @Param('purchaseOrderId') purchaseOrderId: string,
  ) {
    return this.goodsReceiptsService.findByPurchaseOrder(
      user.organisationId!,
      user.role,
      purchaseOrderId,
    );
  }
}
