"use client";

import Link from "next/link";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { GrnStatusBadge } from "@/features/goods-receipts/components/grn-status-badge";
import { usePurchaseOrderGoodsReceipts } from "@/features/goods-receipts/hooks/use-goods-receipts";
import type { PurchaseOrder } from "@/features/purchase-orders/types";

type PoGrnPanelProps = {
  po: PurchaseOrder;
  canManage: boolean;
};

const ELIGIBLE_PO_STATUSES = ["ISSUED", "ACKNOWLEDGED", "PARTIALLY_DELIVERED"];

export function PoGrnPanel({ po, canManage }: PoGrnPanelProps) {
  const grnsQuery = usePurchaseOrderGoodsReceipts(po.id);
  const receipts = grnsQuery.data?.goodsReceipts ?? [];
  const canCreate = canManage && ELIGIBLE_PO_STATUSES.includes(po.status);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div>
            <CardTitle>Goods receipts</CardTitle>
            <CardDescription>
              Receive goods against this purchase order.
            </CardDescription>
          </div>
          {canCreate ? (
            <Button asChild size="sm">
              <Link
                href={`/dashboard/goods-receipts/new?purchaseOrderId=${po.id}`}
              >
                <Plus className="size-4" />
                Create receipt
              </Link>
            </Button>
          ) : null}
        </div>
      </CardHeader>
      <CardContent>
        {grnsQuery.isLoading ? (
          <p className="text-muted-foreground text-sm">Loading receipts...</p>
        ) : receipts.length === 0 ? (
          <p className="text-muted-foreground text-sm">
            No goods receipts yet.
            {canCreate
              ? " Create a draft receipt to begin receiving goods."
              : " PO must be issued before receiving goods."}
          </p>
        ) : (
          <ul className="space-y-2">
            {receipts.map((receipt) => (
              <li
                key={receipt.id}
                className="flex items-center justify-between rounded-lg border p-3 text-sm"
              >
                <Link
                  href={`/dashboard/goods-receipts/${receipt.id}`}
                  className="font-medium hover:underline"
                >
                  {receipt.receiptNumber}
                </Link>
                <GrnStatusBadge status={receipt.status} />
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
