import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { Role } from '@prisma/client';

import { MessageResponseDto } from '../common/dto/message-response.dto';
import {
  deleteOrganisationResponseExample,
  organisationResponseExample,
  updateOrganisationRequestExample,
} from '../common/swagger/swagger-examples';
import type { JwtPayload } from '../common/types/jwt-payload.interface';
import { CurrentUser } from '../auth/decorators/current-user/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt/jwt.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { TenantGuard } from '../auth/guards/tenant.guard';
import { OrganisationResponseDto } from './dto/organisation-response.dto';
import { UpdateMemberRoleDto } from './dto/update-member-role.dto';
import { UpdateOrganisationDto } from './dto/update-organisation.dto';
import { OrganisationsService } from './organisations.service';

@ApiTags('organisations')
@ApiBearerAuth('JWT-auth')
@Controller('organisations/me')
@UseGuards(JwtAuthGuard, TenantGuard)
export class OrganisationsController {
  constructor(private readonly organisationsService: OrganisationsService) {}

  @Get()
  @ApiOperation({
    summary: 'Get current tenant organisation',
    description:
      'Returns the organisation associated with the authenticated user.',
  })
  @ApiOkResponse({
    description: 'Current tenant organisation',
    type: OrganisationResponseDto,
    schema: { example: organisationResponseExample },
  })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid JWT' })
  @ApiForbiddenResponse({ description: 'Missing tenant context in JWT' })
  @ApiNotFoundResponse({ description: 'Organisation not found' })
  getCurrent(@CurrentUser() user: JwtPayload) {
    return this.organisationsService.findCurrentTenant(user.organisationId!);
  }

  @Patch()
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.PROCUREMENT_MANAGER)
  @ApiOperation({
    summary: 'Update current tenant organisation',
    description:
      'Updates the name of the authenticated user tenant organisation.',
  })
  @ApiBody({
    type: UpdateOrganisationDto,
    description: 'Organisation update payload',
    examples: {
      rename: {
        summary: 'Rename organisation',
        description: 'Updates the display name of the current tenant',
        value: updateOrganisationRequestExample,
      },
    },
  })
  @ApiOkResponse({
    description: 'Organisation updated',
    type: OrganisationResponseDto,
    schema: {
      example: {
        ...organisationResponseExample,
        name: updateOrganisationRequestExample.name,
        updatedAt: '2026-07-31T11:00:00.000Z',
      },
    },
  })
  @ApiForbiddenResponse({ description: 'Insufficient permissions' })
  updateCurrent(
    @CurrentUser() user: JwtPayload,
    @Body() dto: UpdateOrganisationDto,
  ) {
    return this.organisationsService.updateCurrentTenant(
      user.organisationId!,
      dto,
    );
  }

  @Patch('members/:userId/role')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Update organisation member role' })
  @ApiOkResponse({ description: 'Member role updated' })
  @ApiForbiddenResponse({ description: 'Admin access required' })
  async updateMemberRole(
    @CurrentUser() user: JwtPayload,
    @Param('userId') userId: string,
    @Body() dto: UpdateMemberRoleDto,
  ) {
    await this.organisationsService.updateMemberRole(
      user.organisationId!,
      userId,
      dto,
      user.sub,
    );

    return this.organisationsService.findCurrentTenant(user.organisationId!);
  }

  @Delete()
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({
    summary: 'Delete current tenant organisation',
    description:
      'Permanently deletes the tenant organisation and all associated users.',
  })
  @ApiOkResponse({
    description: 'Organisation deleted',
    type: MessageResponseDto,
    schema: { example: deleteOrganisationResponseExample },
  })
  @ApiForbiddenResponse({ description: 'Insufficient permissions' })
  async deleteCurrent(@CurrentUser() user: JwtPayload) {
    await this.organisationsService.deleteCurrentTenant(user.organisationId!);

    return deleteOrganisationResponseExample;
  }
}
