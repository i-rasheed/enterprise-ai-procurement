import type { ComplianceStatus, VendorStatus } from "../types";

export function formatVendorStatus(status: VendorStatus): string {
  return status.charAt(0) + status.slice(1).toLowerCase();
}

export function formatComplianceStatus(status: ComplianceStatus): string {
  return status.charAt(0) + status.slice(1).toLowerCase();
}

export function getRiskScoreLabel(score: number): string {
  if (score <= 25) return "Low";
  if (score <= 50) return "Moderate";
  if (score <= 75) return "High";
  return "Critical";
}

export function getRiskScoreColor(score: number): string {
  if (score <= 25) return "text-emerald-600";
  if (score <= 50) return "text-amber-600";
  if (score <= 75) return "text-orange-600";
  return "text-destructive";
}
