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
  bidResponseExample,
  createBidItemRequestExample,
  createBidRequestExample,
  deleteBidItemResponseExample,
  deleteBidResponseExample,
  paginatedBidResponseExample,
  submitBidRequestExample,
  updateBidRequestExample,
  uploadBidAttachmentRequestExample,
} from '../common/swagger/swagger-examples';
import type { JwtPayload } from '../common/types/jwt-payload.interface';
import { BID_VIEW_ROLES } from './constants/bid-role.constants';
import { BidsService } from './bids.service';
import {
  BidListResponseDto,
  BidResponseDto,
  DeleteBidItemResponseDto,
  DeleteBidResponseDto,
  PaginatedBidResponseDto,
  SubmitBidResponseDto,
} from './dto/bid-response.dto';
import { CreateBidDto } from './dto/create-bid.dto';
import { CreateBidItemDto } from './dto/create-bid-item.dto';
import { ListBidQueryDto } from './dto/list-bid-query.dto';
import { SubmitBidDto } from './dto/submit-bid.dto';
import { UpdateBidDto } from './dto/update-bid.dto';
import { UploadBidAttachmentDto } from './dto/upload-bid-attachment.dto';

@ApiTags('bids')
@ApiBearerAuth('JWT-auth')
@Controller('bids')
@UseGuards(JwtAuthGuard, TenantGuard)
export class BidsController {
  constructor(private readonly bidsService: BidsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create draft bid',
    description:
      'Creates a draft bid for an invited vendor on a published RFQ. Vendor representative only.',
  })
  @ApiBody({
    type: CreateBidDto,
    examples: {
      default: {
        summary: 'Create vendor bid',
        value: createBidRequestExample,
      },
    },
  })
  @ApiCreatedResponse({
    description: 'Draft bid created',
    type: BidResponseDto,
    schema: { example: bidResponseExample },
  })
  @ApiForbiddenResponse({ description: 'Vendor not invited or not authorized' })
  @ApiConflictResponse({ description: 'Active bid already exists' })
  create(@CurrentUser() user: JwtPayload, @Body() dto: CreateBidDto) {
    return this.bidsService.create(
      user.organisationId!,
      user.sub,
      user.email,
      dto,
    );
  }

  @Get()
  @UseGuards(RolesGuard)
  @Roles(...BID_VIEW_ROLES)
  @ApiOperation({
    summary: 'List bids',
    description:
      'Returns paginated bids. Procurement managers and admins only.',
  })
  @ApiOkResponse({
    description: 'Paginated bid list',
    type: PaginatedBidResponseDto,
    schema: { example: paginatedBidResponseExample },
  })
  findAll(@CurrentUser() user: JwtPayload, @Query() query: ListBidQueryDto) {
    return this.bidsService.findAll(
      user.organisationId!,
      user.email,
      user.role,
      query,
    );
  }

  @Delete('items/:itemId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Remove bid line item' })
  @ApiOkResponse({
    description: 'Bid item removed',
    type: DeleteBidItemResponseDto,
    schema: { example: deleteBidItemResponseExample },
  })
  @ApiNotFoundResponse({ description: 'Bid item not found' })
  removeItem(@CurrentUser() user: JwtPayload, @Param('itemId') itemId: string) {
    return this.bidsService.removeItem(
      user.organisationId!,
      user.email,
      itemId,
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get bid by ID' })
  @ApiOkResponse({
    description: 'Bid details',
    type: BidResponseDto,
    schema: { example: bidResponseExample },
  })
  @ApiForbiddenResponse({ description: 'Not authorized to view this bid' })
  findOne(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.bidsService.findOne(
      user.organisationId!,
      user.email,
      user.role,
      id,
    );
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update draft bid' })
  @ApiBody({
    type: UpdateBidDto,
    examples: {
      default: {
        summary: 'Update bid terms',
        value: updateBidRequestExample,
      },
    },
  })
  @ApiOkResponse({
    description: 'Draft bid updated',
    type: BidResponseDto,
    schema: { example: bidResponseExample },
  })
  update(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Body() dto: UpdateBidDto,
  ) {
    return this.bidsService.update(user.organisationId!, user.email, id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete draft bid' })
  @ApiOkResponse({
    description: 'Bid deleted',
    type: DeleteBidResponseDto,
    schema: { example: deleteBidResponseExample },
  })
  delete(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.bidsService.deleteDraft(user.organisationId!, user.email, id);
  }

  @Post(':id/submit')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Submit bid' })
  @ApiBody({
    type: SubmitBidDto,
    examples: {
      default: {
        summary: 'Submit bid',
        value: submitBidRequestExample,
      },
    },
  })
  @ApiOkResponse({
    description: 'Bid submitted',
    type: SubmitBidResponseDto,
    schema: { example: { ...bidResponseExample, status: 'SUBMITTED' } },
  })
  @ApiBadRequestResponse({
    description: 'Missing items, total mismatch, or RFQ closed',
  })
  submit(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Body() dto: SubmitBidDto,
  ) {
    return this.bidsService.submit(user.organisationId!, user.email, id, dto);
  }

  @Post(':id/withdraw')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Withdraw submitted bid' })
  @ApiOkResponse({
    description: 'Bid withdrawn',
    type: BidResponseDto,
    schema: { example: { ...bidResponseExample, status: 'WITHDRAWN' } },
  })
  @ApiBadRequestResponse({ description: 'RFQ closed or bid not submitted' })
  withdraw(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.bidsService.withdraw(user.organisationId!, user.email, id);
  }

  @Post(':id/items')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Add bid line item' })
  @ApiBody({
    type: CreateBidItemDto,
    examples: {
      default: {
        summary: 'Add chair line item',
        value: createBidItemRequestExample,
      },
    },
  })
  @ApiCreatedResponse({
    description: 'Line item added',
    type: BidResponseDto,
    schema: { example: bidResponseExample },
  })
  addItem(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Body() dto: CreateBidItemDto,
  ) {
    return this.bidsService.addItem(user.organisationId!, user.email, id, dto);
  }

  @Post(':id/attachments')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Upload bid attachment metadata',
    description:
      'Stores attachment metadata. Storage provider integration is deferred.',
  })
  @ApiBody({
    type: UploadBidAttachmentDto,
    examples: {
      default: {
        summary: 'Attach quotation PDF',
        value: uploadBidAttachmentRequestExample,
      },
    },
  })
  @ApiCreatedResponse({
    description: 'Attachment metadata stored',
    type: BidResponseDto,
    schema: { example: bidResponseExample },
  })
  addAttachment(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Body() dto: UploadBidAttachmentDto,
  ) {
    return this.bidsService.addAttachment(
      user.organisationId!,
      user.email,
      id,
      dto,
    );
  }
}

@ApiTags('bids')
@ApiBearerAuth('JWT-auth')
@Controller('vendors')
@UseGuards(JwtAuthGuard, TenantGuard)
export class VendorBidsController {
  constructor(private readonly bidsService: BidsService) {}

  @Get(':vendorId/bids')
  @ApiOperation({
    summary: 'List bids by vendor',
    description:
      'Procurement managers and admins see all vendor bids. Vendors see only their own.',
  })
  @ApiOkResponse({
    description: 'Vendor bids',
    type: BidListResponseDto,
    schema: { example: { bids: [bidResponseExample] } },
  })
  findByVendor(
    @CurrentUser() user: JwtPayload,
    @Param('vendorId') vendorId: string,
  ) {
    return this.bidsService.findByVendor(
      user.organisationId!,
      user.email,
      user.role,
      vendorId,
    );
  }
}

@ApiTags('bids')
@ApiBearerAuth('JWT-auth')
@Controller('rfqs')
@UseGuards(JwtAuthGuard, TenantGuard, RolesGuard)
@Roles(...BID_VIEW_ROLES)
export class RfqBidsController {
  constructor(private readonly bidsService: BidsService) {}

  @Get(':rfqId/bids')
  @ApiOperation({
    summary: 'List bids by RFQ',
    description: 'Procurement managers and admins only.',
  })
  @ApiOkResponse({
    description: 'RFQ bids',
    type: BidListResponseDto,
    schema: { example: { bids: [bidResponseExample] } },
  })
  findByRfq(@CurrentUser() user: JwtPayload, @Param('rfqId') rfqId: string) {
    return this.bidsService.findByRfq(user.organisationId!, user.role, rfqId);
  }
}
