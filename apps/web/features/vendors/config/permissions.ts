import { hasPermission } from "@/features/organization/config/permissions";
import type { Role } from "@/lib/api/types";

export function canManageVendors(role?: Role | null): boolean {
  return hasPermission(role, "manage_vendors");
}

export function canAnalyzeVendorRisk(role?: Role | null): boolean {
  return (
    role === "ADMIN" ||
    role === "PROCUREMENT_MANAGER" ||
    role === "FINANCE"
  );
}
