"use client";

import Link from "next/link";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { GrnStatusBadge } from "@/features/goods-receipts/components/grn-status-badge";
import { usePurchaseOrderGoodsReceipts } from "@/features/goods-receipts/hooks/use-goods-receipts";
import type { GoodsReceipt } from "@/features/goods-receipts/types";

type GrnHistoryPanelProps = {
  purchaseOrderId: string;
  currentReceiptId?: string;
};

export function GrnHistoryPanel({
  purchaseOrderId,
  currentReceiptId,
}: GrnHistoryPanelProps) {
  const historyQuery = usePurchaseOrderGoodsReceipts(purchaseOrderId);
  const receipts = historyQuery.data?.goodsReceipts ?? [];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Receipt history</CardTitle>
        <CardDescription>
          All goods receipts linked to this purchase order.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {historyQuery.isLoading ? (
          <p className="text-muted-foreground text-sm">Loading history...</p>
        ) : receipts.length === 0 ? (
          <p className="text-muted-foreground text-sm">
            No goods receipts recorded for this purchase order yet.
          </p>
        ) : (
          <ul className="space-y-3">
            {receipts.map((receipt) => (
              <GrnHistoryItem
                key={receipt.id}
                receipt={receipt}
                isCurrent={receipt.id === currentReceiptId}
              />
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}

function GrnHistoryItem({
  receipt,
  isCurrent,
}: {
  receipt: GoodsReceipt;
  isCurrent?: boolean;
}) {
  const totalReceived = receipt.items.reduce(
    (sum, item) => sum + item.quantityReceived,
    0,
  );

  return (
    <li
      className={`flex items-center justify-between rounded-lg border p-3 text-sm ${
        isCurrent ? "border-primary bg-primary/5" : ""
      }`}
    >
      <div>
        <Link
          href={`/dashboard/goods-receipts/${receipt.id}`}
          className="font-medium hover:underline"
        >
          {receipt.receiptNumber}
          {isCurrent ? " (current)" : ""}
        </Link>
        <p className="text-muted-foreground mt-1 text-xs">
          {new Date(receipt.receiptDate).toLocaleDateString()} ·{" "}
          {receipt.warehouse ?? "No warehouse"} · {totalReceived} units received
        </p>
      </div>
      <GrnStatusBadge status={receipt.status} />
    </li>
  );
}
