import type { Role } from "@/lib/api/types";

const AI_ACCESS_ROLES: Role[] = ["ADMIN", "PROCUREMENT_MANAGER", "FINANCE"];

export function canAccessAssistant(role?: Role | null): boolean {
  if (!role) return false;
  return AI_ACCESS_ROLES.includes(role);
}
