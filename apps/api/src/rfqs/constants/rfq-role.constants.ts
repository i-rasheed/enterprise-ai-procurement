import { Role } from '@prisma/client';

export const RFQ_CREATE_PUBLISH_ROLES: Role[] = [
  Role.ADMIN,
  Role.PROCUREMENT_MANAGER,
];

export const RFQ_VENDOR_INVITE_ROLES: Role[] = [Role.PROCUREMENT_MANAGER];
