import { Injectable, NotFoundException } from '@nestjs/common';

import { UpdateOrganisationDto } from './dto/update-organisation.dto';
import { OrganisationRepository } from './organisation.repository';

@Injectable()
export class OrganisationsService {
  constructor(
    private readonly organisationRepository: OrganisationRepository,
  ) {}

  async findCurrentTenant(organisationId: string) {
    const organisation =
      await this.organisationRepository.findById(organisationId);

    if (!organisation) {
      throw new NotFoundException('Organisation not found');
    }

    return organisation;
  }

  async updateCurrentTenant(
    organisationId: string,
    dto: UpdateOrganisationDto,
  ) {
    await this.findCurrentTenant(organisationId);

    return this.organisationRepository.update(organisationId, {
      name: dto.name,
    });
  }

  async deleteCurrentTenant(organisationId: string) {
    await this.findCurrentTenant(organisationId);

    return this.organisationRepository.delete(organisationId);
  }
}
