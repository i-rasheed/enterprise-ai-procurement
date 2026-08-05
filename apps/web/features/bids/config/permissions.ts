import type { Role } from "@/lib/api/types";

export function canViewBids(role?: Role | null): boolean {
  return (
    role === "ADMIN" ||
    role === "PROCUREMENT_MANAGER" ||
    role === "FINANCE"
  );
}

export function canEvaluateBids(role?: Role | null): boolean {
  return role === "ADMIN" || role === "PROCUREMENT_MANAGER";
}

export function canAwardBid(role?: Role | null): boolean {
  return role === "ADMIN";
}

export function canGetRecommendations(role?: Role | null): boolean {
  return (
    role === "ADMIN" ||
    role === "PROCUREMENT_MANAGER" ||
    role === "FINANCE"
  );
}

export function formatBidStatus(status: string): string {
  return status.charAt(0) + status.slice(1).toLowerCase();
}
