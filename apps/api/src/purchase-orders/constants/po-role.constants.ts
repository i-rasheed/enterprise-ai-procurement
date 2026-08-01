import { Role } from '@prisma/client';

export const PO_MANAGEMENT_ROLES: Role[] = [
  Role.ADMIN,
  Role.PROCUREMENT_MANAGER,
  Role.FINANCE,
];

export const PO_VIEW_ROLES: Role[] = [...PO_MANAGEMENT_ROLES];
