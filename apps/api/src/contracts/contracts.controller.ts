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
  ApiCreatedResponse,
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
  contractHistoryResponseExample,
  contractResponseExample,
  createContractRequestExample,
  deleteContractResponseExample,
  paginatedContractResponseExample,
  renewContractRequestExample,
  terminateContractRequestExample,
  updateContractRequestExample,
  uploadContractDocumentRequestExample,
} from '../common/swagger/swagger-examples';
import type { JwtPayload } from '../common/types/jwt-payload.interface';
import {
  CONTRACT_MANAGE_ROLES,
  CONTRACT_VIEW_ROLES,
} from './constants/contract-role.constants';
import { ContractsService } from './contracts.service';
import {
  ContractHistoryResponseDto,
  ContractResponseDto,
  DeleteContractResponseDto,
  PaginatedContractResponseDto,
} from './dto/contract-response.dto';
import { CreateContractDto } from './dto/create-contract.dto';
import { ListContractQueryDto } from './dto/list-contract-query.dto';
import { RenewContractDto } from './dto/renew-contract.dto';
import { TerminateContractDto } from './dto/terminate-contract.dto';
import { UpdateContractDto } from './dto/update-contract.dto';
import { UploadContractDocumentDto } from './dto/upload-contract-document.dto';

@ApiTags('contracts')
@ApiBearerAuth('JWT-auth')
@Controller('contracts')
@UseGuards(JwtAuthGuard, TenantGuard)
export class ContractsController {
  constructor(private readonly contractsService: ContractsService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles(...CONTRACT_MANAGE_ROLES)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create draft contract',
    description:
      'Creates a contract from an awarded bid or approved purchase order.',
  })
  @ApiBody({
    type: CreateContractDto,
    examples: {
      default: {
        summary: 'Create contract from award',
        value: createContractRequestExample,
      },
    },
  })
  @ApiCreatedResponse({
    description: 'Draft contract created',
    type: ContractResponseDto,
    schema: { example: contractResponseExample },
  })
  create(@CurrentUser() user: JwtPayload, @Body() dto: CreateContractDto) {
    return this.contractsService.create(
      user.organisationId!,
      user.sub,
      user.role,
      dto,
    );
  }

  @Get()
  @UseGuards(RolesGuard)
  @Roles(...CONTRACT_VIEW_ROLES)
  @ApiOperation({ summary: 'List contracts' })
  @ApiOkResponse({
    description: 'Paginated contract list',
    type: PaginatedContractResponseDto,
    schema: { example: paginatedContractResponseExample },
  })
  findAll(
    @CurrentUser() user: JwtPayload,
    @Query() query: ListContractQueryDto,
  ) {
    return this.contractsService.findAll(
      user.organisationId!,
      user.email,
      user.role,
      query,
    );
  }

  @Get(':id/history')
  @UseGuards(RolesGuard)
  @Roles(...CONTRACT_VIEW_ROLES)
  @ApiOperation({ summary: 'Get contract version history' })
  @ApiOkResponse({
    description: 'Contract version history',
    type: ContractHistoryResponseDto,
    schema: { example: contractHistoryResponseExample },
  })
  history(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.contractsService.history(
      user.organisationId!,
      user.email,
      user.role,
      id,
    );
  }

  @Get(':id')
  @UseGuards(RolesGuard)
  @Roles(...CONTRACT_VIEW_ROLES)
  @ApiOperation({ summary: 'Get contract by ID' })
  @ApiOkResponse({
    description: 'Contract details',
    type: ContractResponseDto,
    schema: { example: contractResponseExample },
  })
  @ApiNotFoundResponse({ description: 'Contract not found' })
  findOne(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.contractsService.findOne(
      user.organisationId!,
      user.email,
      user.role,
      id,
    );
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles(...CONTRACT_MANAGE_ROLES)
  @ApiOperation({ summary: 'Update draft contract' })
  @ApiBody({
    type: UpdateContractDto,
    examples: {
      default: {
        summary: 'Update contract terms',
        value: updateContractRequestExample,
      },
    },
  })
  @ApiOkResponse({
    description: 'Contract updated',
    type: ContractResponseDto,
    schema: { example: contractResponseExample },
  })
  update(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Body() dto: UpdateContractDto,
  ) {
    return this.contractsService.update(
      user.organisationId!,
      user.role,
      user.sub,
      id,
      dto,
    );
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(...CONTRACT_MANAGE_ROLES)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete draft contract' })
  @ApiOkResponse({
    description: 'Contract deleted',
    type: DeleteContractResponseDto,
    schema: { example: deleteContractResponseExample },
  })
  delete(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.contractsService.delete(user.organisationId!, user.role, id);
  }

  @Post(':id/activate')
  @UseGuards(RolesGuard)
  @Roles(...CONTRACT_MANAGE_ROLES)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Activate contract' })
  @ApiOkResponse({
    description: 'Contract activated',
    type: ContractResponseDto,
    schema: { example: { ...contractResponseExample, status: 'ACTIVE' } },
  })
  activate(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.contractsService.activate(
      user.organisationId!,
      user.role,
      user.sub,
      id,
    );
  }

  @Post(':id/renew')
  @UseGuards(RolesGuard)
  @Roles(...CONTRACT_MANAGE_ROLES)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Renew active contract' })
  @ApiBody({
    type: RenewContractDto,
    examples: {
      default: {
        summary: 'Renew for new term',
        value: renewContractRequestExample,
      },
    },
  })
  @ApiOkResponse({
    description: 'Contract renewed',
    type: ContractResponseDto,
    schema: { example: contractResponseExample },
  })
  renew(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Body() dto: RenewContractDto,
  ) {
    return this.contractsService.renew(
      user.organisationId!,
      user.role,
      user.sub,
      id,
      dto,
    );
  }

  @Post(':id/terminate')
  @UseGuards(RolesGuard)
  @Roles(...CONTRACT_MANAGE_ROLES)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Terminate contract' })
  @ApiBody({
    type: TerminateContractDto,
    examples: {
      default: {
        summary: 'Terminate contract',
        value: terminateContractRequestExample,
      },
    },
  })
  @ApiOkResponse({
    description: 'Contract terminated',
    type: ContractResponseDto,
    schema: { example: { ...contractResponseExample, status: 'TERMINATED' } },
  })
  terminate(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Body() dto: TerminateContractDto,
  ) {
    return this.contractsService.terminate(
      user.organisationId!,
      user.role,
      user.sub,
      id,
      dto,
    );
  }

  @Post(':id/expire')
  @UseGuards(RolesGuard)
  @Roles(...CONTRACT_MANAGE_ROLES)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Expire active contract' })
  @ApiOkResponse({
    description: 'Contract expired',
    type: ContractResponseDto,
    schema: { example: { ...contractResponseExample, status: 'EXPIRED' } },
  })
  expire(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.contractsService.expire(
      user.organisationId!,
      user.role,
      user.sub,
      id,
    );
  }

  @Post(':id/documents')
  @UseGuards(RolesGuard)
  @Roles(...CONTRACT_MANAGE_ROLES)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Upload contract document metadata',
    description: 'Stores provider-agnostic document metadata for a contract.',
  })
  @ApiBody({
    type: UploadContractDocumentDto,
    examples: {
      default: {
        summary: 'Upload MSA document',
        value: uploadContractDocumentRequestExample,
      },
    },
  })
  @ApiCreatedResponse({ description: 'Document metadata stored' })
  uploadDocument(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Body() dto: UploadContractDocumentDto,
  ) {
    return this.contractsService.uploadDocument(
      user.organisationId!,
      user.role,
      user.sub,
      id,
      dto,
    );
  }
}
