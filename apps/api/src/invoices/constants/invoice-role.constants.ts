import { Role } from '@prisma/client';

export const INVOICE_CREATE_ROLES: Role[] = [
  Role.ADMIN,
  Role.FINANCE,
  Role.USER,
];

export const INVOICE_VIEW_ROLES: Role[] = [
  Role.ADMIN,
  Role.FINANCE,
  Role.PROCUREMENT_MANAGER,
  Role.USER,
];

export const INVOICE_APPROVE_ROLES: Role[] = [Role.ADMIN, Role.FINANCE];

export const INVOICE_PAY_ROLES: Role[] = [Role.ADMIN, Role.FINANCE];
