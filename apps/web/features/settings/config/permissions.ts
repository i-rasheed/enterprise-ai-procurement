import type { Role } from "@/lib/api/types";

import {
  canManageMembers,
  canManageOrganization,
} from "@/features/organization/config/permissions";

export function canManageBranding(role?: Role | null): boolean {
  return canManageOrganization(role);
}

export function canManageApiKeys(role?: Role | null): boolean {
  return role === "ADMIN";
}

export function canViewAuditLogs(role?: Role | null): boolean {
  return (
    role === "ADMIN" ||
    role === "FINANCE" ||
    role === "PROCUREMENT_MANAGER" ||
    role === "DEPARTMENT_HEAD"
  );
}

export function canManageRoles(role?: Role | null): boolean {
  return canManageMembers(role);
}

export { canManageOrganization, canManageMembers };
