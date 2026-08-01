"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getRemainingQuantity } from "@/features/goods-receipts/config/permissions";
import {
  receiveGoodsSchema,
  type ReceiveGoodsFormValues,
} from "@/features/goods-receipts/schemas/goods-receipt.schema";
import { useReceiveGoods } from "@/features/goods-receipts/hooks/use-goods-receipts";
import type { GoodsReceipt } from "@/features/goods-receipts/types";

type ReceiveGoodsFormProps = {
  grn: GoodsReceipt;
  canReceive: boolean;
};

export function ReceiveGoodsForm({ grn, canReceive }: ReceiveGoodsFormProps) {
  const receiveGoods = useReceiveGoods(grn.id);

  const form = useForm<ReceiveGoodsFormValues>({
    resolver: zodResolver(receiveGoodsSchema),
    defaultValues: {
      items: grn.items.map((item) => ({
        goodsReceiptItemId: item.id,
        quantityReceived: item.quantityReceived,
      })),
    },
  });

  const onSubmit = form.handleSubmit((values) => {
    receiveGoods.mutate(values);
  });

  if (!canReceive) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Receive goods</CardTitle>
          <CardDescription>
            Receiving is not available for completed or fully rejected receipts.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Receive goods</CardTitle>
        <CardDescription>
          Record received quantities. Supports partial receipts — enter absolute
          totals per line item.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-4">
          {grn.items.map((item, index) => {
            const remaining = getRemainingQuantity(item);
            return (
              <div
                key={item.id}
                className="grid gap-3 rounded-lg border p-4 sm:grid-cols-2"
              >
                <div>
                  <p className="text-sm font-medium">Line {index + 1}</p>
                  <p className="text-muted-foreground text-xs">
                    Ordered {item.quantityOrdered} · Received{" "}
                    {item.quantityReceived} · Rejected {item.quantityRejected} ·{" "}
                    Remaining {remaining}
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`received-${item.id}`}>
                    Quantity received (total)
                  </Label>
                  <Input
                    id={`received-${item.id}`}
                    type="number"
                    min={0}
                    max={item.quantityOrdered - item.quantityRejected}
                    disabled={receiveGoods.isPending || remaining === 0}
                    {...form.register(`items.${index}.quantityReceived`, {
                      valueAsNumber: true,
                    })}
                  />
                </div>
              </div>
            );
          })}

          {form.formState.errors.items?.message ||
          form.formState.errors.items?.root?.message ? (
            <p className="text-destructive text-sm">
              {form.formState.errors.items.message ??
                form.formState.errors.items.root?.message}
            </p>
          ) : null}

          <Button type="submit" disabled={receiveGoods.isPending}>
            {receiveGoods.isPending ? "Recording..." : "Record receipt"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
