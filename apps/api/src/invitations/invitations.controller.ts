import {
  Body,
  Controller,
  Delete,
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
import { Role } from '@prisma/client';

import { CurrentUser } from '../auth/decorators/current-user/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt/jwt.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import type { JwtPayload } from '../common/types/jwt-payload.interface';
import {
  acceptInvitationRequestExample,
  acceptInvitationResponseExample,
  cancelInvitationResponseExample,
} from '../common/swagger/swagger-examples';
import {
  AcceptInvitationResponseDto,
  CancelInvitationResponseDto,
} from './dto/invitation-response.dto';
import { AcceptInvitationDto } from './dto/accept-invitation.dto';
import { InvitationsService } from './invitations.service';

@ApiTags('invitations')
@Controller('invitations')
export class InvitationsController {
  constructor(private readonly invitationsService: InvitationsService) {}

  @Post('accept')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Accept invitation',
    description:
      'Public endpoint. Creates a user account and links them to the invited organisation.',
  })
  @ApiBody({
    type: AcceptInvitationDto,
    examples: {
      default: {
        summary: 'Accept invitation',
        value: acceptInvitationRequestExample,
      },
    },
  })
  @ApiCreatedResponse({
    description: 'Invitation accepted',
    type: AcceptInvitationResponseDto,
    schema: { example: acceptInvitationResponseExample },
  })
  @ApiBadRequestResponse({
    description: 'Invitation expired, cancelled, or already accepted',
  })
  @ApiConflictResponse({ description: 'User already exists in organisation' })
  @ApiNotFoundResponse({ description: 'Invitation not found' })
  acceptInvitation(@Body() dto: AcceptInvitationDto) {
    return this.invitationsService.acceptInvitation(dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Cancel invitation',
    description:
      'Cancels a pending invitation. Admin must belong to the organisation.',
  })
  @ApiOkResponse({
    description: 'Invitation cancelled',
    type: CancelInvitationResponseDto,
    schema: { example: cancelInvitationResponseExample },
  })
  @ApiBadRequestResponse({ description: 'Invitation cannot be cancelled' })
  @ApiForbiddenResponse({ description: 'Admin access required' })
  @ApiNotFoundResponse({ description: 'Invitation not found' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid JWT' })
  cancelInvitation(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.invitationsService.cancelInvitation(id, user);
  }
}
