import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
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
} from '@nestjs/swagger';

import { CurrentUser } from '../auth/decorators/current-user/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt/jwt.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { TenantGuard } from '../auth/guards/tenant.guard';
import {
  awardBidRequestExample,
  awardResponseExample,
  bidEvaluationListResponseExample,
  bidEvaluationResponseExample,
  createEvaluationRequestExample,
  procurementRankingsResponseExample,
  updateEvaluationRequestExample,
} from '../common/swagger/swagger-examples';
import type { JwtPayload } from '../common/types/jwt-payload.interface';
import { BidEvaluationService } from './bid-evaluation.service';
import {
  AWARD_ROLES,
  EVALUATION_ROLES,
} from './constants/evaluation-role.constants';
import { AwardBidDto } from './dto/award-bid.dto';
import { CreateEvaluationDto } from './dto/create-evaluation.dto';
import {
  AwardListResponseDto,
  AwardResponseDto,
  BidEvaluationListResponseDto,
  BidEvaluationResponseDto,
  ProcurementRankingsResponseDto,
} from './dto/evaluation-response.dto';
import { UpdateEvaluationDto } from './dto/update-evaluation.dto';

@ApiTags('bid-evaluations')
@ApiBearerAuth('JWT-auth')
@Controller('bid-evaluations')
@UseGuards(JwtAuthGuard, TenantGuard, RolesGuard)
@Roles(...EVALUATION_ROLES)
export class BidEvaluationsController {
  constructor(private readonly bidEvaluationService: BidEvaluationService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Evaluate a submitted bid',
    description: 'Procurement managers and admins only.',
  })
  @ApiBody({
    type: CreateEvaluationDto,
    examples: {
      default: {
        summary: 'Evaluate bid scores',
        value: createEvaluationRequestExample,
      },
    },
  })
  @ApiCreatedResponse({
    description: 'Bid evaluation created',
    type: BidEvaluationResponseDto,
    schema: { example: bidEvaluationResponseExample },
  })
  @ApiBadRequestResponse({ description: 'Bid is not submitted' })
  @ApiConflictResponse({ description: 'Evaluator already scored this bid' })
  create(@CurrentUser() user: JwtPayload, @Body() dto: CreateEvaluationDto) {
    return this.bidEvaluationService.createEvaluation(
      user.organisationId!,
      user.sub,
      dto,
    );
  }

  @Get(':bidId')
  @ApiOperation({ summary: 'Get evaluations for a bid' })
  @ApiOkResponse({
    description: 'Bid evaluation summary',
    type: BidEvaluationListResponseDto,
    schema: { example: bidEvaluationListResponseExample },
  })
  @ApiNotFoundResponse({ description: 'Bid not found' })
  findByBid(@CurrentUser() user: JwtPayload, @Param('bidId') bidId: string) {
    return this.bidEvaluationService.getEvaluations(
      user.organisationId!,
      bidId,
    );
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a bid evaluation' })
  @ApiBody({
    type: UpdateEvaluationDto,
    examples: {
      default: {
        summary: 'Update evaluation scores',
        value: updateEvaluationRequestExample,
      },
    },
  })
  @ApiOkResponse({
    description: 'Bid evaluation updated',
    type: BidEvaluationResponseDto,
    schema: { example: bidEvaluationResponseExample },
  })
  @ApiBadRequestResponse({ description: 'Awarded bid cannot be edited' })
  update(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Body() dto: UpdateEvaluationDto,
  ) {
    return this.bidEvaluationService.updateEvaluation(
      user.organisationId!,
      id,
      dto,
    );
  }
}

@ApiTags('procurement-requests')
@ApiBearerAuth('JWT-auth')
@Controller('procurement-requests')
@UseGuards(JwtAuthGuard, TenantGuard, RolesGuard)
@Roles(...EVALUATION_ROLES)
export class ProcurementRankingsController {
  constructor(private readonly bidEvaluationService: BidEvaluationService) {}

  @Get(':id/rankings')
  @ApiOperation({
    summary: 'Rank bids for a procurement request',
    description:
      'Ranks evaluated bids by total score. Ties break on lower bid amount.',
  })
  @ApiOkResponse({
    description: 'Bid rankings',
    type: ProcurementRankingsResponseDto,
    schema: { example: procurementRankingsResponseExample },
  })
  @ApiNotFoundResponse({ description: 'Procurement request not found' })
  getRankings(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.bidEvaluationService.getRankings(user.organisationId!, id);
  }
}

@ApiTags('awards')
@ApiBearerAuth('JWT-auth')
@Controller('awards')
@UseGuards(JwtAuthGuard, TenantGuard)
export class AwardsController {
  constructor(private readonly bidEvaluationService: BidEvaluationService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles(...AWARD_ROLES)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Award winning bid',
    description:
      'Admins only. Finalizes the winning bid for a procurement request.',
  })
  @ApiBody({
    type: AwardBidDto,
    examples: {
      default: {
        summary: 'Award best bid',
        value: awardBidRequestExample,
      },
    },
  })
  @ApiCreatedResponse({
    description: 'Bid awarded',
    type: AwardResponseDto,
    schema: { example: awardResponseExample },
  })
  @ApiConflictResponse({
    description: 'Procurement request already has an award',
  })
  @ApiForbiddenResponse({ description: 'Admins only' })
  award(@CurrentUser() user: JwtPayload, @Body() dto: AwardBidDto) {
    return this.bidEvaluationService.awardBid(
      user.organisationId!,
      user.sub,
      dto,
    );
  }

  @Get()
  @UseGuards(RolesGuard)
  @Roles(...EVALUATION_ROLES)
  @ApiOperation({ summary: 'List awards' })
  @ApiOkResponse({
    description: 'Award history',
    type: AwardListResponseDto,
    schema: { example: { awards: [awardResponseExample] } },
  })
  list(@CurrentUser() user: JwtPayload) {
    return this.bidEvaluationService.listAwards(user.organisationId!);
  }

  @Get(':id')
  @UseGuards(RolesGuard)
  @Roles(...EVALUATION_ROLES)
  @ApiOperation({ summary: 'Get award by ID' })
  @ApiOkResponse({
    description: 'Award details',
    type: AwardResponseDto,
    schema: { example: awardResponseExample },
  })
  @ApiNotFoundResponse({ description: 'Award not found' })
  findOne(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.bidEvaluationService.getAward(user.organisationId!, id);
  }
}
