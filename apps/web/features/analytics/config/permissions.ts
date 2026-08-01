import type { Role } from "@/lib/api/types";

const ANALYTICS_ACCESS_ROLES: Role[] = [
  "ADMIN",
  "FINANCE",
  "PROCUREMENT_MANAGER",
  "DEPARTMENT_HEAD",
];

export function canAccessAnalytics(role?: Role | null): boolean {
  if (!role) return false;
  return ANALYTICS_ACCESS_ROLES.includes(role);
}
