import { Role } from '@prisma/client';

/** Full analytics access (executive stand-in: ADMIN). */
export const ANALYTICS_FULL_ACCESS_ROLES: Role[] = [
  Role.ADMIN,
  Role.FINANCE,
  Role.PROCUREMENT_MANAGER,
];

export const ANALYTICS_DEPARTMENT_SCOPED_ROLES: Role[] = [Role.DEPARTMENT_HEAD];

export const ANALYTICS_ACCESS_ROLES: Role[] = [
  ...ANALYTICS_FULL_ACCESS_ROLES,
  ...ANALYTICS_DEPARTMENT_SCOPED_ROLES,
];
