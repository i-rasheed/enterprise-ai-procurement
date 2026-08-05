import { Role } from '@prisma/client';

export const CONTRACT_MANAGE_ROLES: Role[] = [
  Role.ADMIN,
  Role.PROCUREMENT_MANAGER,
  Role.FINANCE,
];

export const CONTRACT_VIEW_ROLES: Role[] = [
  ...CONTRACT_MANAGE_ROLES,
  Role.USER,
];
