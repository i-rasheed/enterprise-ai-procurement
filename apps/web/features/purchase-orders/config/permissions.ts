import type { Role } from "@/lib/api/types";

import type { PurchaseOrder } from "../types";

export function canViewPurchaseOrders(role?: Role | null): boolean {
  return (
    role === "ADMIN" ||
    role === "PROCUREMENT_MANAGER" ||
    role === "FINANCE"
  );
}

export function canManagePurchaseOrders(role?: Role | null): boolean {
  return (
    role === "ADMIN" ||
    role === "PROCUREMENT_MANAGER" ||
    role === "FINANCE"
  );
}

export function formatPurchaseOrderStatus(status: string): string {
  return status
    .split("_")
    .map((part) => part.charAt(0) + part.slice(1).toLowerCase())
    .join(" ");
}

export function canEditPurchaseOrder(po: PurchaseOrder): boolean {
  return po.status === "DRAFT";
}

export function canIssuePurchaseOrder(po: PurchaseOrder): boolean {
  return po.status === "DRAFT";
}

export function canDeletePurchaseOrder(po: PurchaseOrder): boolean {
  return po.status === "DRAFT";
}

export function canCancelPurchaseOrder(po: PurchaseOrder): boolean {
  return po.status !== "CANCELLED" && po.status !== "COMPLETED";
}

export function canAcknowledgePurchaseOrder(
  po: PurchaseOrder,
  userEmail?: string | null,
): boolean {
  return (
    po.status === "ISSUED" &&
    Boolean(userEmail) &&
    userEmail!.toLowerCase() === po.vendor.email.toLowerCase()
  );
}
