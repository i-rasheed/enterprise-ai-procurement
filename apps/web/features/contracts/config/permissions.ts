import type { Role } from "@/lib/api/types";

import type { Contract } from "../types";

export function canViewContracts(role?: Role | null): boolean {
  return (
    role === "ADMIN" ||
    role === "PROCUREMENT_MANAGER" ||
    role === "FINANCE" ||
    role === "USER"
  );
}

export function canManageContracts(role?: Role | null): boolean {
  return (
    role === "ADMIN" ||
    role === "PROCUREMENT_MANAGER" ||
    role === "FINANCE"
  );
}

export function formatContractStatus(status: string): string {
  return status
    .split("_")
    .map((part) => part.charAt(0) + part.slice(1).toLowerCase())
    .join(" ");
}

export function formatContractType(type: string): string {
  return type.charAt(0) + type.slice(1).toLowerCase();
}

export function canEditContract(contract: Contract): boolean {
  return contract.status === "DRAFT" || contract.status === "UNDER_REVIEW";
}

export function canDeleteContract(contract: Contract): boolean {
  return contract.status === "DRAFT";
}

export function canActivateContract(contract: Contract): boolean {
  return contract.status === "DRAFT" || contract.status === "UNDER_REVIEW";
}

export function canRenewContract(contract: Contract): boolean {
  return contract.status === "ACTIVE";
}

export function canExpireContract(contract: Contract): boolean {
  return contract.status === "ACTIVE";
}

export function canTerminateContract(contract: Contract): boolean {
  return contract.status !== "TERMINATED" && contract.status !== "EXPIRED";
}

export function canUploadDocuments(contract: Contract): boolean {
  return contract.status !== "EXPIRED" && contract.status !== "TERMINATED";
}

export function getDaysUntilExpiry(endDate: string): number {
  const end = new Date(endDate);
  const now = new Date();
  return Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

export function isExpiringSoon(
  contract: Contract,
  withinDays = 30,
): boolean {
  if (contract.status !== "ACTIVE") return false;
  const days = getDaysUntilExpiry(contract.endDate);
  return days >= 0 && days <= withinDays;
}

export function isPastEndDate(contract: Contract): boolean {
  return getDaysUntilExpiry(contract.endDate) < 0;
}
