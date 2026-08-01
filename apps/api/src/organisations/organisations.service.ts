import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Role } from '@prisma/client';

import { ASSIGNABLE_MEMBER_ROLES } from '../common/constants/role.constants';
import { UsersService } from '../users/users.service';
import { CreateOrganisationDto } from './dto/create-organisation.dto';
import { UpdateMemberRoleDto } from './dto/update-member-role.dto';
import { UpdateOrganisationDto } from './dto/update-organisation.dto';
import { OrganisationRepository } from './organisation.repository';
import { toOrganisationSlug } from './utils/organisation-slug.util';

@Injectable()
export class OrganisationsService {
  constructor(
    private readonly organisationRepository: OrganisationRepository,
    private readonly usersService: UsersService,
  ) {}

  create(dto: CreateOrganisationDto) {
    return this.organisationRepository.create({
      name: dto.name,
      slug: toOrganisationSlug(dto.name),
    });
  }

  async findAll() {
    const organisations = await this.organisationRepository.findAll();

    return { organisations };
  }

  async findOne(id: string) {
    const organisation = await this.organisationRepository.findById(id);

    if (!organisation) {
      throw new NotFoundException('Organisation not found');
    }

    return organisation;
  }

  async update(id: string, dto: UpdateOrganisationDto) {
    await this.findOne(id);

    return this.organisationRepository.update(id, { name: dto.name });
  }

  async delete(id: string) {
    await this.findOne(id);

    await this.organisationRepository.delete(id);

    return {
      message: 'Organisation deleted successfully',
    };
  }

  async findCurrentTenant(organisationId: string) {
    return this.findOne(organisationId);
  }

  async updateCurrentTenant(
    organisationId: string,
    dto: UpdateOrganisationDto,
  ) {
    return this.update(organisationId, dto);
  }

  async deleteCurrentTenant(organisationId: string) {
    await this.findOne(organisationId);

    return this.organisationRepository.delete(organisationId);
  }

  async updateMemberRole(
    organisationId: string,
    memberId: string,
    dto: UpdateMemberRoleDto,
    actorId: string,
  ) {
    if (!ASSIGNABLE_MEMBER_ROLES.includes(dto.role)) {
      throw new BadRequestException('Invalid role assignment');
    }

    const member = await this.usersService.findById(memberId);

    if (!member || member.organisationId !== organisationId) {
      throw new NotFoundException('Member not found');
    }

    if (member.id === actorId && dto.role !== Role.ADMIN) {
      throw new BadRequestException('You cannot remove your own admin access');
    }

    const admins = await this.organisationRepository.countAdmins(organisationId);

    if (member.role === Role.ADMIN && dto.role !== Role.ADMIN && admins <= 1) {
      throw new BadRequestException(
        'Organisation must retain at least one admin',
      );
    }

    return this.usersService.update(memberId, { role: dto.role });
  }
}
