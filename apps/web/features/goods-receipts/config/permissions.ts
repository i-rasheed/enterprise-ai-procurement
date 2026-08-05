import type { Role } from "@/lib/api/types";

import type { GoodsReceipt, GrnTimelineEvent } from "../types";

export function canViewGoodsReceipts(role?: Role | null): boolean {
  return (
    role === "ADMIN" ||
    role === "PROCUREMENT_MANAGER" ||
    role === "USER"
  );
}

export function canManageGoodsReceipts(role?: Role | null): boolean {
  return (
    role === "ADMIN" ||
    role === "PROCUREMENT_MANAGER" ||
    role === "USER"
  );
}

export function canCompleteGoodsReceipt(role?: Role | null): boolean {
  return role === "ADMIN";
}

export function formatGoodsReceiptStatus(status: string): string {
  return status
    .split("_")
    .map((part) => part.charAt(0) + part.slice(1).toLowerCase())
    .join(" ");
}

export function canEditGoodsReceipt(grn: GoodsReceipt): boolean {
  return grn.status === "DRAFT";
}

export function canDeleteGoodsReceipt(grn: GoodsReceipt): boolean {
  return grn.status === "DRAFT";
}

export function canReceiveOrRejectGoods(grn: GoodsReceipt): boolean {
  return grn.status !== "COMPLETED" && grn.status !== "REJECTED";
}

export function canCompleteGrn(grn: GoodsReceipt): boolean {
  return (
    (grn.status === "RECEIVED" || grn.status === "PARTIALLY_RECEIVED") &&
    grn.items.some(
      (item) => item.quantityReceived > 0 || item.quantityRejected > 0,
    )
  );
}

export function getRemainingQuantity(item: GoodsReceipt["items"][number]): number {
  return Math.max(
    0,
    item.quantityOrdered - item.quantityReceived - item.quantityRejected,
  );
}

export function buildGrnTimeline(grn: GoodsReceipt): GrnTimelineEvent[] {
  const events: GrnTimelineEvent[] = [
    {
      id: "created",
      title: "Receipt created",
      description: `Draft ${grn.receiptNumber} created by ${grn.receivedBy.firstName} ${grn.receivedBy.lastName}`,
      timestamp: grn.createdAt,
      status: "completed",
    },
    {
      id: "receipt-date",
      title: "Receipt date scheduled",
      description: grn.warehouse
        ? `Warehouse: ${grn.warehouse}`
        : "Awaiting warehouse assignment",
      timestamp: grn.receiptDate,
      status: grn.warehouse ? "completed" : "pending",
    },
  ];

  grn.items.forEach((item) => {
    if (item.quantityReceived > 0) {
      events.push({
        id: `received-${item.id}`,
        title: "Goods received",
        description: `${item.quantityReceived} of ${item.quantityOrdered} units received`,
        timestamp: item.updatedAt,
        status: "completed",
      });
    }
    if (item.quantityRejected > 0) {
      events.push({
        id: `rejected-${item.id}`,
        title: "Items rejected",
        description: item.remarks
          ? `${item.quantityRejected} rejected — ${item.remarks}`
          : `${item.quantityRejected} of ${item.quantityOrdered} units rejected`,
        timestamp: item.updatedAt,
        status: "rejected",
      });
    }
  });

  if (grn.status === "PARTIALLY_RECEIVED") {
    events.push({
      id: "partial",
      title: "Partial receipt recorded",
      description: "Some line items still have outstanding quantities",
      timestamp: grn.updatedAt,
      status: "current",
    });
  }

  if (grn.status === "RECEIVED") {
    events.push({
      id: "received-all",
      title: "All goods accounted for",
      description: "All line items fully received or rejected",
      timestamp: grn.updatedAt,
      status: "completed",
    });
  }

  if (grn.status === "REJECTED") {
    events.push({
      id: "rejected-all",
      title: "Receipt rejected",
      description: "All items were rejected with no goods received",
      timestamp: grn.updatedAt,
      status: "rejected",
    });
  }

  if (grn.status === "COMPLETED") {
    events.push({
      id: "completed",
      title: "Receipt completed",
      description: "Goods receipt finalized and closed",
      timestamp: grn.updatedAt,
      status: "completed",
    });
  }

  return events.sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
  );
}
