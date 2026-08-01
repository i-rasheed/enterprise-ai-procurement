import type { EmbeddingEntityType } from "../types";

export function getEntityRoute(
  entityType: EmbeddingEntityType,
  entityId: string,
): string {
  switch (entityType) {
    case "CONTRACT":
      return `/dashboard/contracts/${entityId}`;
    case "RFQ":
      return `/dashboard/rfqs/${entityId}`;
    case "PURCHASE_ORDER":
      return `/dashboard/purchase-orders/${entityId}`;
    case "INVOICE":
      return `/dashboard/invoices/${entityId}`;
    case "PROCUREMENT_REQUEST":
      return `/dashboard/procurement/${entityId}`;
    case "BID":
      return `/dashboard/bids/${entityId}`;
    default:
      return "/dashboard";
  }
}

export function formatEntityType(entityType: EmbeddingEntityType): string {
  return entityType
    .split("_")
    .map((part) => part.charAt(0) + part.slice(1).toLowerCase())
    .join(" ");
}
