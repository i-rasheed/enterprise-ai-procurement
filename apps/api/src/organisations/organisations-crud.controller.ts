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
} from '@nestjs/common';
import {
  ApiBody,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';

import { MessageResponseDto } from '../common/dto/message-response.dto';
import {
  createOrganisationRequestExample,
  deleteOrganisationResponseExample,
  organisationListResponseExample,
  organisationResponseExample,
  updateOrganisationRequestExample,
} from '../common/swagger/swagger-examples';
import { CreateOrganisationDto } from './dto/create-organisation.dto';
import {
  OrganisationListResponseDto,
  OrganisationSummaryResponseDto,
} from './dto/organisation-summary-response.dto';
import { OrganisationResponseDto } from './dto/organisation-response.dto';
import { UpdateOrganisationDto } from './dto/update-organisation.dto';
import { OrganisationsService } from './organisations.service';

@ApiTags('organisations')
@Controller('organisations')
export class OrganisationsCrudController {
  constructor(private readonly organisationsService: OrganisationsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create organisation',
    description: 'Creates a new organisation record.',
  })
  @ApiBody({
    type: CreateOrganisationDto,
    examples: {
      acme: {
        summary: 'Create Acme Corp',
        value: createOrganisationRequestExample,
      },
    },
  })
  @ApiCreatedResponse({
    description: 'Organisation created',
    type: OrganisationSummaryResponseDto,
    schema: {
      example: {
        id: organisationResponseExample.id,
        name: createOrganisationRequestExample.name,
        createdAt: organisationResponseExample.createdAt,
        updatedAt: organisationResponseExample.updatedAt,
      },
    },
  })
  create(@Body() dto: CreateOrganisationDto) {
    return this.organisationsService.create(dto);
  }

  @Get()
  @ApiOperation({
    summary: 'List organisations',
    description: 'Returns all organisations ordered by newest first.',
  })
  @ApiOkResponse({
    description: 'Organisation list',
    type: OrganisationListResponseDto,
    schema: { example: organisationListResponseExample },
  })
  findAll() {
    return this.organisationsService.findAll();
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get organisation by ID',
    description: 'Returns a single organisation including linked users.',
  })
  @ApiOkResponse({
    description: 'Organisation details',
    type: OrganisationResponseDto,
    schema: { example: organisationResponseExample },
  })
  @ApiNotFoundResponse({ description: 'Organisation not found' })
  findOne(@Param('id') id: string) {
    return this.organisationsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Update organisation',
    description: 'Updates an organisation name by ID.',
  })
  @ApiBody({
    type: UpdateOrganisationDto,
    examples: {
      rename: {
        summary: 'Rename organisation',
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
  @ApiNotFoundResponse({ description: 'Organisation not found' })
  update(@Param('id') id: string, @Body() dto: UpdateOrganisationDto) {
    return this.organisationsService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Delete organisation',
    description:
      'Permanently deletes an organisation. Linked users are detached from the organisation.',
  })
  @ApiOkResponse({
    description: 'Organisation deleted',
    type: MessageResponseDto,
    schema: { example: deleteOrganisationResponseExample },
  })
  @ApiNotFoundResponse({ description: 'Organisation not found' })
  delete(@Param('id') id: string) {
    return this.organisationsService.delete(id);
  }
}
