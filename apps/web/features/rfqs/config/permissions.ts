import type { Role } from "@/lib/api/types";

import type { RFQ } from "../types";

export function canManageRfqs(role?: Role | null): boolean {
  return role === "ADMIN" || role === "PROCUREMENT_MANAGER";
}

export function canInviteVendors(role?: Role | null): boolean {
  return role === "PROCUREMENT_MANAGER";
}

export function canEditRfq(rfq: RFQ): boolean {
  return rfq.status === "DRAFT" || rfq.status === "PUBLISHED";
}

export function canDeleteRfq(rfq: RFQ): boolean {
  return rfq.status === "DRAFT";
}

export function canPublishRfq(rfq: RFQ): boolean {
  return rfq.status === "DRAFT" && (rfq.vendors?.length ?? 0) > 0;
}

export function canInviteToRfq(rfq: RFQ): boolean {
  return rfq.status === "DRAFT";
}

export function formatRfqStatus(status: string): string {
  return status.charAt(0) + status.slice(1).toLowerCase();
}

export function formatInvitationStatus(status: string): string {
  return status.charAt(0) + status.slice(1).toLowerCase();
}

export function isClosingDatePast(closingDate: string): boolean {
  return new Date(closingDate).getTime() < Date.now();
}
