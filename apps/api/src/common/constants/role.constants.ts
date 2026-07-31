import { Role } from '@prisma/client';

export const ASSIGNABLE_MEMBER_ROLES: Role[] = [
  Role.ADMIN,
  Role.PROCUREMENT_MANAGER,
  Role.FINANCE,
  Role.DEPARTMENT_HEAD,
  Role.APPROVER,
  Role.VENDOR,
  Role.USER,
];

export const ORGANISATION_ADMIN_ROLES: Role[] = [Role.SUPER_ADMIN, Role.ADMIN];

export const MEMBER_MANAGEMENT_ROLES: Role[] = [Role.SUPER_ADMIN, Role.ADMIN];
