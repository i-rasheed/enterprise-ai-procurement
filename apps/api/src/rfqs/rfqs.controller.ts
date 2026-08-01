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
import { Role } from '@prisma/client';

import { CurrentUser } from '../auth/decorators/current-user/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt/jwt.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { TenantGuard } from '../auth/guards/tenant.guard';
import {
  createRfqRequestExample,
  deleteRfqResponseExample,
  inviteVendorRequestExample,
  paginatedRfqResponseExample,
  publishRfqRequestExample,
  rfqResponseExample,
  rfqVendorListResponseExample,
  updateRfqRequestExample,
} from '../common/swagger/swagger-examples';
import type { JwtPayload } from '../common/types/jwt-payload.interface';
import { RFQ_CREATE_PUBLISH_ROLES } from './constants/rfq-role.constants';
import { CreateRFQDto } from './dto/create-rfq.dto';
import { InviteVendorDto } from './dto/invite-vendor.dto';
import { ListRFQQueryDto } from './dto/list-rfq-query.dto';
import { PublishRFQDto } from './dto/publish-rfq.dto';
import {
  DeleteRFQResponseDto,
  PaginatedRFQResponseDto,
  PublishRFQResponseDto,
  RFQResponseDto,
  RFQVendorListResponseDto,
} from './dto/rfq-response.dto';
import { UpdateRFQDto } from './dto/update-rfq.dto';
import { RFQService } from './rfqs.service';

@ApiTags('rfqs')
@ApiBearerAuth('JWT-auth')
@Controller('rfqs')
@UseGuards(JwtAuthGuard, TenantGuard)
export class RFQsController {
  constructor(private readonly rfqService: RFQService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles(...RFQ_CREATE_PUBLISH_ROLES)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create RFQ',
    description:
      'Creates a draft RFQ for an approved procurement request. Procurement managers and admins only.',
  })
  @ApiBody({
    type: CreateRFQDto,
    examples: {
      default: {
        summary: 'Office furniture RFQ',
        value: createRfqRequestExample,
      },
    },
  })
  @ApiCreatedResponse({
    description: 'Draft RFQ created',
    type: RFQResponseDto,
    schema: { example: rfqResponseExample },
  })
  @ApiBadRequestResponse({
    description:
      'Procurement request is not approved or closing date is invalid',
  })
  @ApiForbiddenResponse({ description: 'Insufficient permissions' })
  create(@CurrentUser() user: JwtPayload, @Body() dto: CreateRFQDto) {
    return this.rfqService.create(user.organisationId!, user.sub, dto);
  }

  @Get()
  @ApiOperation({
    summary: 'List RFQs',
    description:
      'Returns paginated RFQs with optional status and search filters.',
  })
  @ApiOkResponse({
    description: 'Paginated RFQ list',
    type: PaginatedRFQResponseDto,
    schema: { example: paginatedRfqResponseExample },
  })
  findAll(@CurrentUser() user: JwtPayload, @Query() query: ListRFQQueryDto) {
    return this.rfqService.findAll(user.organisationId!, query);
  }

  @Get(':id/vendors')
  @ApiOperation({ summary: 'List invited vendors for an RFQ' })
  @ApiOkResponse({
    description: 'Invited vendors',
    type: RFQVendorListResponseDto,
    schema: { example: rfqVendorListResponseExample },
  })
  @ApiNotFoundResponse({ description: 'RFQ not found' })
  listVendors(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.rfqService.listVendors(user.organisationId!, id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get RFQ by ID' })
  @ApiOkResponse({
    description: 'RFQ details',
    type: RFQResponseDto,
    schema: { example: rfqResponseExample },
  })
  @ApiNotFoundResponse({ description: 'RFQ not found' })
  findOne(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.rfqService.findOne(user.organisationId!, id);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles(...RFQ_CREATE_PUBLISH_ROLES)
  @ApiOperation({
    summary: 'Update RFQ',
    description:
      'Updates a draft RFQ fully. Published RFQs only allow closing date changes.',
  })
  @ApiBody({
    type: UpdateRFQDto,
    examples: {
      default: {
        summary: 'Extend closing date',
        value: updateRfqRequestExample,
      },
    },
  })
  @ApiOkResponse({
    description: 'RFQ updated',
    type: RFQResponseDto,
    schema: { example: rfqResponseExample },
  })
  @ApiBadRequestResponse({ description: 'RFQ cannot be edited' })
  @ApiNotFoundResponse({ description: 'RFQ not found' })
  update(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Body() dto: UpdateRFQDto,
  ) {
    return this.rfqService.update(user.organisationId!, id, dto);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(...RFQ_CREATE_PUBLISH_ROLES)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete draft RFQ' })
  @ApiOkResponse({
    description: 'RFQ deleted',
    type: DeleteRFQResponseDto,
    schema: { example: deleteRfqResponseExample },
  })
  @ApiBadRequestResponse({ description: 'Only draft RFQs can be deleted' })
  delete(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.rfqService.deleteDraft(user.organisationId!, id);
  }

  @Post(':id/publish')
  @UseGuards(RolesGuard)
  @Roles(...RFQ_CREATE_PUBLISH_ROLES)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Publish RFQ',
    description: 'Publishes a draft RFQ. Requires at least one invited vendor.',
  })
  @ApiBody({
    type: PublishRFQDto,
    examples: {
      default: {
        summary: 'Publish with note',
        value: publishRfqRequestExample,
      },
    },
  })
  @ApiOkResponse({
    description: 'RFQ published',
    type: PublishRFQResponseDto,
    schema: { example: { ...rfqResponseExample, status: 'PUBLISHED' } },
  })
  @ApiBadRequestResponse({
    description: 'RFQ is not draft or has no invited vendors',
  })
  publish(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Body() dto: PublishRFQDto,
  ) {
    return this.rfqService.publish(user.organisationId!, id, dto);
  }

  @Post(':id/close')
  @UseGuards(RolesGuard)
  @Roles(...RFQ_CREATE_PUBLISH_ROLES)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Close published RFQ' })
  @ApiOkResponse({
    description: 'RFQ closed',
    type: RFQResponseDto,
    schema: { example: { ...rfqResponseExample, status: 'CLOSED' } },
  })
  @ApiBadRequestResponse({ description: 'Only published RFQs can be closed' })
  close(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.rfqService.close(user.organisationId!, id);
  }

  @Post(':id/cancel')
  @UseGuards(RolesGuard)
  @Roles(...RFQ_CREATE_PUBLISH_ROLES)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Cancel RFQ' })
  @ApiOkResponse({
    description: 'RFQ cancelled',
    type: RFQResponseDto,
    schema: { example: { ...rfqResponseExample, status: 'CANCELLED' } },
  })
  @ApiBadRequestResponse({ description: 'RFQ cannot be cancelled' })
  cancel(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.rfqService.cancel(user.organisationId!, id);
  }

  @Post(':id/vendors')
  @UseGuards(RolesGuard)
  @Roles(Role.PROCUREMENT_MANAGER)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Invite vendor to RFQ',
    description: 'Invites a vendor to a draft RFQ. Procurement managers only.',
  })
  @ApiBody({
    type: InviteVendorDto,
    examples: {
      default: {
        summary: 'Invite Globex Supplies',
        value: inviteVendorRequestExample,
      },
    },
  })
  @ApiCreatedResponse({
    description: 'Vendor invited',
    type: RFQResponseDto,
    schema: { example: rfqResponseExample },
  })
  @ApiConflictResponse({ description: 'Vendor already invited' })
  @ApiForbiddenResponse({ description: 'Procurement managers only' })
  @ApiBadRequestResponse({ description: 'RFQ is not in draft status' })
  inviteVendor(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Body() dto: InviteVendorDto,
  ) {
    return this.rfqService.inviteVendor(
      user.organisationId!,
      user.role,
      id,
      dto,
    );
  }
}
