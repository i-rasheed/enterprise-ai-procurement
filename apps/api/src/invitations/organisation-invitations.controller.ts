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
import { Role } from '@prisma/client';

import { CurrentUser } from '../auth/decorators/current-user/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt/jwt.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import type { JwtPayload } from '../common/types/jwt-payload.interface';
import {
  inviteUserRequestExample,
  invitationListResponseExample,
  createInvitationResponseExample,
} from '../common/swagger/swagger-examples';
import {
  CreateInvitationResponseDto,
  InvitationListResponseDto,
} from './dto/invitation-response.dto';
import { InviteUserDto } from './dto/invite-user.dto';
import { InvitationsService } from './invitations.service';

@ApiTags('invitations')
@ApiBearerAuth('JWT-auth')
@Controller('organisations/:organisationId/invitations')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
export class OrganisationInvitationsController {
  constructor(private readonly invitationsService: InvitationsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Invite user to organisation',
    description:
      'Creates a pending invitation for the given email. Admin must belong to the organisation.',
  })
  @ApiBody({
    type: InviteUserDto,
    examples: {
      buyer: {
        summary: 'Invite procurement user',
        value: inviteUserRequestExample,
      },
    },
  })
  @ApiCreatedResponse({
    description: 'Invitation created',
    type: CreateInvitationResponseDto,
    schema: { example: createInvitationResponseExample },
  })
  @ApiConflictResponse({
    description: 'Pending invitation or existing member conflict',
  })
  @ApiForbiddenResponse({ description: 'Admin access required' })
  @ApiNotFoundResponse({ description: 'Organisation not found' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid JWT' })
  inviteUser(
    @Param('organisationId') organisationId: string,
    @CurrentUser() user: JwtPayload,
    @Body() dto: InviteUserDto,
  ) {
    return this.invitationsService.inviteUser(organisationId, user, dto);
  }

  @Get()
  @ApiOperation({
    summary: 'List organisation invitations',
    description: 'Returns pending invitations for the organisation.',
  })
  @ApiOkResponse({
    description: 'Pending invitation list',
    type: InvitationListResponseDto,
    schema: { example: invitationListResponseExample },
  })
  @ApiForbiddenResponse({ description: 'Admin access required' })
  @ApiNotFoundResponse({ description: 'Organisation not found' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid JWT' })
  listInvitations(
    @Param('organisationId') organisationId: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.invitationsService.listOrganisationInvitations(
      organisationId,
      user,
    );
  }
}
