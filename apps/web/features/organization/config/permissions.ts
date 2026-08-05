import type { Role } from "@/lib/api/types";

import type { PermissionKey, RolePermissionMap } from "../types";

export const ASSIGNABLE_ROLES: Role[] = [
  "ADMIN",
  "FINANCE",
  "PROCUREMENT_MANAGER",
  "DEPARTMENT_HEAD",
  "USER",
];

export const ROLE_LABELS: Record<Role, string> = {
  ADMIN: "Administrator",
  FINANCE: "Finance",
  PROCUREMENT_MANAGER: "Procurement Manager",
  DEPARTMENT_HEAD: "Department Head",
  USER: "User",
};

export const PERMISSION_LABELS: Record<PermissionKey, string> = {
  view_dashboard: "View dashboard",
  manage_organization: "Manage organization profile",
  manage_members: "Manage members & roles",
  manage_invitations: "Manage invitations",
  manage_procurement: "Manage procurement",
  manage_vendors: "Manage vendors",
  manage_finance: "Manage finance",
  view_analytics: "View analytics",
  approve_requests: "Approve requests",
};

export const ROLE_PERMISSIONS: RolePermissionMap = {
  ADMIN: [
    "view_dashboard",
    "manage_organization",
    "manage_members",
    "manage_invitations",
    "manage_procurement",
    "manage_vendors",
    "manage_finance",
    "view_analytics",
    "approve_requests",
  ],
  FINANCE: [
    "view_dashboard",
    "manage_finance",
    "view_analytics",
    "approve_requests",
  ],
  PROCUREMENT_MANAGER: [
    "view_dashboard",
    "manage_organization",
    "manage_procurement",
    "manage_vendors",
    "view_analytics",
    "approve_requests",
  ],
  DEPARTMENT_HEAD: [
    "view_dashboard",
    "manage_procurement",
    "approve_requests",
  ],
  USER: ["view_dashboard", "manage_procurement"],
};

export function canManageOrganization(role?: Role | null): boolean {
  return role === "ADMIN" || role === "PROCUREMENT_MANAGER";
}

export function canManageMembers(role?: Role | null): boolean {
  return role === "ADMIN";
}

export function hasPermission(
  role: Role | null | undefined,
  permission: PermissionKey,
): boolean {
  if (!role) return false;
  return ROLE_PERMISSIONS[role].includes(permission);
}
