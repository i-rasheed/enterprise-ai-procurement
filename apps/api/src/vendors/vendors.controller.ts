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
  createVendorRequestExample,
  deleteVendorResponseExample,
  paginatedVendorResponseExample,
  updateVendorRequestExample,
  vendorResponseExample,
} from '../common/swagger/swagger-examples';
import type { JwtPayload } from '../common/types/jwt-payload.interface';
import { CreateVendorDto } from './dto/create-vendor.dto';
import { ListVendorQueryDto, SearchVendorDto } from './dto/search-vendor.dto';
import { UpdateVendorDto } from './dto/update-vendor.dto';
import {
  DeleteVendorResponseDto,
  PaginatedVendorResponseDto,
  VendorResponseDto,
} from './dto/vendor-response.dto';
import { VendorsService } from './vendors.service';

@ApiTags('vendors')
@ApiBearerAuth('JWT-auth')
@Controller('vendors')
@UseGuards(JwtAuthGuard, TenantGuard)
export class VendorsController {
  constructor(private readonly vendorsService: VendorsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create vendor',
    description:
      'Creates a vendor scoped to the authenticated user organisation.',
  })
  @ApiBody({
    type: CreateVendorDto,
    examples: {
      default: {
        summary: 'Create Globex Supplies',
        value: createVendorRequestExample,
      },
    },
  })
  @ApiCreatedResponse({
    description: 'Vendor created',
    type: VendorResponseDto,
    schema: { example: vendorResponseExample },
  })
  @ApiConflictResponse({
    description: 'Duplicate email or registration number in organisation',
  })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid JWT' })
  @ApiForbiddenResponse({ description: 'Missing tenant context in JWT' })
  create(@CurrentUser() user: JwtPayload, @Body() dto: CreateVendorDto) {
    return this.vendorsService.create(user.organisationId!, dto);
  }

  @Get('search')
  @ApiOperation({
    summary: 'Search vendors',
    description: 'Search vendors by term and optional filters with pagination.',
  })
  @ApiOkResponse({
    description: 'Paginated vendor search results',
    type: PaginatedVendorResponseDto,
    schema: { example: paginatedVendorResponseExample },
  })
  search(@CurrentUser() user: JwtPayload, @Query() query: SearchVendorDto) {
    return this.vendorsService.search(user.organisationId!, query);
  }

  @Get()
  @ApiOperation({
    summary: 'List vendors',
    description: 'Returns paginated vendors for the current organisation.',
  })
  @ApiOkResponse({
    description: 'Paginated vendor list',
    type: PaginatedVendorResponseDto,
    schema: { example: paginatedVendorResponseExample },
  })
  findAll(@CurrentUser() user: JwtPayload, @Query() query: ListVendorQueryDto) {
    return this.vendorsService.findAll(user.organisationId!, query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get vendor by ID' })
  @ApiOkResponse({
    description: 'Vendor details',
    type: VendorResponseDto,
    schema: { example: vendorResponseExample },
  })
  @ApiNotFoundResponse({ description: 'Vendor not found' })
  findOne(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.vendorsService.findOne(user.organisationId!, id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update vendor' })
  @ApiBody({
    type: UpdateVendorDto,
    examples: {
      default: {
        summary: 'Update vendor status',
        value: updateVendorRequestExample,
      },
    },
  })
  @ApiOkResponse({
    description: 'Vendor updated',
    type: VendorResponseDto,
    schema: { example: vendorResponseExample },
  })
  @ApiConflictResponse({
    description: 'Duplicate email or registration number in organisation',
  })
  @ApiNotFoundResponse({ description: 'Vendor not found' })
  update(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Body() dto: UpdateVendorDto,
  ) {
    return this.vendorsService.update(user.organisationId!, id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Delete vendor',
    description:
      'Permanently deletes a vendor record. Hard delete is used because soft delete is not yet part of the platform data model.',
  })
  @ApiOkResponse({
    description: 'Vendor deleted',
    type: DeleteVendorResponseDto,
    schema: { example: deleteVendorResponseExample },
  })
  @ApiNotFoundResponse({ description: 'Vendor not found' })
  delete(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.vendorsService.delete(user.organisationId!, id);
  }
}
