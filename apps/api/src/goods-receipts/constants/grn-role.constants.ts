import { Role } from '@prisma/client';

export const GRN_RECEIVE_ROLES: Role[] = [
  Role.ADMIN,
  Role.PROCUREMENT_MANAGER,
  Role.USER,
];

export const GRN_VIEW_ROLES: Role[] = [...GRN_RECEIVE_ROLES];

export const GRN_COMPLETE_ROLES: Role[] = [Role.ADMIN];
