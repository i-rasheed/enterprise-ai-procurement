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
  rejectGoodsSchema,
  type RejectGoodsFormValues,
} from "@/features/goods-receipts/schemas/goods-receipt.schema";
import { useRejectGoods } from "@/features/goods-receipts/hooks/use-goods-receipts";
import type { GoodsReceipt } from "@/features/goods-receipts/types";

type RejectGoodsFormProps = {
  grn: GoodsReceipt;
  canReject: boolean;
};

export function RejectGoodsForm({ grn, canReject }: RejectGoodsFormProps) {
  const rejectGoods = useRejectGoods(grn.id);

  const form = useForm<RejectGoodsFormValues>({
    resolver: zodResolver(rejectGoodsSchema),
    defaultValues: {
      items: grn.items.map((item) => ({
        goodsReceiptItemId: item.id,
        quantityRejected: item.quantityRejected,
        remarks: item.remarks ?? "",
      })),
    },
  });

  const onSubmit = form.handleSubmit((values) => {
    const hasRejections = values.items.some((item) => item.quantityRejected > 0);
    if (!hasRejections) {
      form.setError("items", {
        message: "Enter at least one rejected quantity greater than zero",
      });
      return;
    }
    rejectGoods.mutate(values);
  });

  if (!canReject) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Rejected items</CardTitle>
          <CardDescription>
            Rejection is not available for completed or fully rejected receipts.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Rejected items</CardTitle>
        <CardDescription>
          Record rejected quantities with mandatory remarks explaining the
          rejection reason.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-4">
          {grn.items.map((item, index) => {
            const remaining = getRemainingQuantity(item);
            return (
              <div
                key={item.id}
                className="space-y-3 rounded-lg border p-4"
              >
                <div>
                  <p className="text-sm font-medium">Line {index + 1}</p>
                  <p className="text-muted-foreground text-xs">
                    Ordered {item.quantityOrdered} · Remaining {remaining}
                  </p>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor={`rejected-${item.id}`}>
                      Quantity rejected (total)
                    </Label>
                    <Input
                      id={`rejected-${item.id}`}
                      type="number"
                      min={0}
                      max={item.quantityOrdered - item.quantityReceived}
                      disabled={rejectGoods.isPending || remaining === 0}
                      {...form.register(`items.${index}.quantityRejected`, {
                        valueAsNumber: true,
                      })}
                    />
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor={`remarks-${item.id}`}>
                      Rejection remarks
                    </Label>
                    <textarea
                      id={`remarks-${item.id}`}
                      rows={2}
                      className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex min-h-[60px] w-full rounded-md border px-3 py-2 text-sm shadow-xs focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                      placeholder="Required when rejecting items..."
                      disabled={rejectGoods.isPending}
                      {...form.register(`items.${index}.remarks`)}
                    />
                    {form.formState.errors.items?.[index]?.remarks ? (
                      <p className="text-destructive text-sm">
                        {form.formState.errors.items[index]?.remarks?.message}
                      </p>
                    ) : null}
                  </div>
                </div>
              </div>
            );
          })}

          {form.formState.errors.items?.message ? (
            <p className="text-destructive text-sm">
              {form.formState.errors.items.message}
            </p>
          ) : null}

          <Button type="submit" variant="destructive" disabled={rejectGoods.isPending}>
            {rejectGoods.isPending ? "Recording..." : "Record rejections"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
