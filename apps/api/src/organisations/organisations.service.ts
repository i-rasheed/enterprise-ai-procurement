import { Injectable, NotFoundException } from '@nestjs/common';

import { CreateOrganisationDto } from './dto/create-organisation.dto';
import { UpdateOrganisationDto } from './dto/update-organisation.dto';
import { OrganisationRepository } from './organisation.repository';
import { toOrganisationSlug } from './utils/organisation-slug.util';

@Injectable()
export class OrganisationsService {
  constructor(
    private readonly organisationRepository: OrganisationRepository,
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
}
