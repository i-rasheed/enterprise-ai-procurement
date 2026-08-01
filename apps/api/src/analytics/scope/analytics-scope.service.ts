import { ForbiddenException, Injectable } from '@nestjs/common';

import type { JwtPayload } from '../../common/types/jwt-payload.interface';
import {
  AnalyticsRepository,
  ResolvedAnalyticsFilter,
} from '../analytics.repository';
import {
  ANALYTICS_DEPARTMENT_SCOPED_ROLES,
  ANALYTICS_FULL_ACCESS_ROLES,
} from '../constants/analytics-role.constants';
import { AnalyticsFilterDto } from '../dto/analytics-filter.dto';

@Injectable()
export class AnalyticsScopeService {
  constructor(private readonly repository: AnalyticsRepository) {}

  async resolveFilter(
    user: JwtPayload,
    dto: AnalyticsFilterDto,
  ): Promise<ResolvedAnalyticsFilter> {
    const organisationId = user.organisationId!;
    const base: ResolvedAnalyticsFilter = {
      organisationId,
      startDate: dto.startDate ? new Date(dto.startDate) : undefined,
      endDate: dto.endDate ? new Date(dto.endDate) : undefined,
      vendorId: dto.vendorId,
      department: dto.department,
      category: dto.category,
      currency: dto.currency,
      status: dto.status,
      requesterId: dto.requesterId,
      approverId: dto.approverId,
      search: dto.search,
      page: dto.page ?? 1,
      limit: dto.limit ?? 20,
      sortBy: dto.sortBy,
      sortOrder: dto.sortOrder ?? 'desc',
    };

    if (ANALYTICS_FULL_ACCESS_ROLES.includes(user.role)) {
      return base;
    }

    if (ANALYTICS_DEPARTMENT_SCOPED_ROLES.includes(user.role)) {
      const allowed = await this.repository.getAllowedDepartments(
        user.sub,
        organisationId,
      );

      if (allowed.length === 0) {
        base.departments = ['__none__'];
        return base;
      }

      if (dto.department) {
        if (!allowed.includes(dto.department)) {
          throw new ForbiddenException(
            'You do not have access to analytics for this department.',
          );
        }
        base.department = dto.department;
      } else {
        base.departments = allowed;
      }

      return base;
    }

    throw new ForbiddenException(
      'You do not have permission to access analytics.',
    );
  }
}
