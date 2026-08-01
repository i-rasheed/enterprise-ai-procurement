"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  canCompleteGrn,
} from "@/features/goods-receipts/config/permissions";
import { useCompleteGoodsReceipt } from "@/features/goods-receipts/hooks/use-goods-receipts";
import type { GoodsReceipt } from "@/features/goods-receipts/types";

type GrnActionsPanelProps = {
  grn: GoodsReceipt;
  canComplete: boolean;
};

export function GrnActionsPanel({ grn, canComplete }: GrnActionsPanelProps) {
  const completeGrn = useCompleteGoodsReceipt(grn.id);
  const showComplete = canComplete && canCompleteGrn(grn);

  if (!showComplete) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Complete receipt</CardTitle>
          <CardDescription>
            {grn.status === "COMPLETED"
              ? "This goods receipt has been finalized."
              : grn.status === "REJECTED"
                ? "Rejected receipts cannot be completed."
                : "An admin can complete the receipt once goods have been received or rejected."}
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const handleComplete = () => {
    if (
      window.confirm(
        `Complete ${grn.receiptNumber}? This finalizes the goods receipt.`,
      )
    ) {
      completeGrn.mutate();
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Complete receipt</CardTitle>
        <CardDescription>
          Admin only. Finalize this goods receipt after all receiving activity
          is recorded.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button
          type="button"
          disabled={completeGrn.isPending}
          onClick={handleComplete}
        >
          {completeGrn.isPending ? "Completing..." : "Complete goods receipt"}
        </Button>
      </CardContent>
    </Card>
  );
}
