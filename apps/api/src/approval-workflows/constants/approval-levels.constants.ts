import { ApprovalLevelRole, Role } from '@prisma/client';

export type ApprovalLevelConfig = {
  level: number;
  role: ApprovalLevelRole;
  assignableRoles: Role[];
};

export const APPROVAL_LEVELS: ApprovalLevelConfig[] = [
  {
    level: 1,
    role: ApprovalLevelRole.DEPARTMENT_HEAD,
    assignableRoles: [Role.DEPARTMENT_HEAD, Role.ADMIN],
  },
  {
    level: 2,
    role: ApprovalLevelRole.PROCUREMENT_MANAGER,
    assignableRoles: [Role.PROCUREMENT_MANAGER, Role.ADMIN],
  },
  {
    level: 3,
    role: ApprovalLevelRole.FINANCE,
    assignableRoles: [Role.FINANCE, Role.ADMIN],
  },
  {
    level: 4,
    role: ApprovalLevelRole.ADMIN,
    assignableRoles: [Role.ADMIN],
  },
];

export const MAX_APPROVAL_LEVEL = APPROVAL_LEVELS.length;
