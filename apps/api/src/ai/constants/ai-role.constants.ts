import { Role } from '@prisma/client';

/** FINANCE serves as legal/compliance stand-in (no LEGAL role in schema). */
export const AI_ACCESS_ROLES: Role[] = [
  Role.ADMIN,
  Role.PROCUREMENT_MANAGER,
  Role.FINANCE,
];
