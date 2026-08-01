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
import {
  createGoodsReceiptSchema,
  updateGoodsReceiptSchema,
  type CreateGoodsReceiptFormValues,
  type UpdateGoodsReceiptFormValues,
} from "@/features/goods-receipts/schemas/goods-receipt.schema";
import type { GoodsReceipt } from "@/features/goods-receipts/types";

export type PurchaseOrderOption = {
  id: string;
  label: string;
};

type GrnCreateFormProps = {
  purchaseOrders: PurchaseOrderOption[];
  submitLabel: string;
  isSubmitting?: boolean;
  onSubmit: (values: CreateGoodsReceiptFormValues) => void;
  onCancel?: () => void;
  defaultPurchaseOrderId?: string;
};

export function GrnCreateForm({
  purchaseOrders,
  submitLabel,
  isSubmitting,
  onSubmit,
  onCancel,
  defaultPurchaseOrderId,
}: GrnCreateFormProps) {
  const form = useForm<CreateGoodsReceiptFormValues>({
    resolver: zodResolver(createGoodsReceiptSchema),
    defaultValues: {
      purchaseOrderId:
        defaultPurchaseOrderId ?? purchaseOrders[0]?.id ?? "",
      receiptDate: new Date().toISOString().slice(0, 10),
      warehouse: "",
      notes: "",
    },
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create goods receipt</CardTitle>
        <CardDescription>
          Create a draft receipt against an issued or partially delivered
          purchase order. Line items are auto-populated from remaining PO
          quantities.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form className="grid gap-4" onSubmit={form.handleSubmit(onSubmit)}>
          <div className="space-y-2">
            <Label htmlFor="purchaseOrderId">Purchase order</Label>
            <select
              id="purchaseOrderId"
              className="border-input bg-background ring-offset-background focus-visible:ring-ring flex h-9 w-full rounded-md border px-3 py-1 text-sm shadow-xs focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
              disabled={
                isSubmitting ||
                purchaseOrders.length === 0 ||
                Boolean(defaultPurchaseOrderId)
              }
              {...form.register("purchaseOrderId")}
            >
              {purchaseOrders.length === 0 ? (
                <option value="">No eligible purchase orders</option>
              ) : (
                purchaseOrders.map((po) => (
                  <option key={po.id} value={po.id}>
                    {po.label}
                  </option>
                ))
              )}
            </select>
            {form.formState.errors.purchaseOrderId ? (
              <p className="text-destructive text-sm">
                {form.formState.errors.purchaseOrderId.message}
              </p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="receiptDate">Receipt date</Label>
            <Input
              id="receiptDate"
              type="date"
              disabled={isSubmitting}
              {...form.register("receiptDate")}
            />
            {form.formState.errors.receiptDate ? (
              <p className="text-destructive text-sm">
                {form.formState.errors.receiptDate.message}
              </p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="warehouse">Warehouse</Label>
            <Input
              id="warehouse"
              placeholder="Central Warehouse - Block A"
              disabled={isSubmitting}
              {...form.register("warehouse")}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <textarea
              id="notes"
              rows={3}
              className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex min-h-[80px] w-full rounded-md border px-3 py-2 text-sm shadow-xs focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
              placeholder="Delivery notes..."
              disabled={isSubmitting}
              {...form.register("notes")}
            />
          </div>

          <div className="flex gap-2">
            <Button
              type="submit"
              disabled={isSubmitting || purchaseOrders.length === 0}
            >
              {isSubmitting ? "Creating..." : submitLabel}
            </Button>
            {onCancel ? (
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
            ) : null}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

type GrnEditFormProps = {
  grn: GoodsReceipt;
  submitLabel: string;
  isSubmitting?: boolean;
  onSubmit: (values: UpdateGoodsReceiptFormValues) => void;
  onCancel?: () => void;
};

export function GrnEditForm({
  grn,
  submitLabel,
  isSubmitting,
  onSubmit,
  onCancel,
}: GrnEditFormProps) {
  const form = useForm<UpdateGoodsReceiptFormValues>({
    resolver: zodResolver(updateGoodsReceiptSchema),
    values: {
      receiptDate: grn.receiptDate.slice(0, 10),
      warehouse: grn.warehouse ?? "",
      notes: grn.notes ?? "",
    },
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Edit draft goods receipt</CardTitle>
        <CardDescription>
          Update receipt date, warehouse, and notes for {grn.receiptNumber}.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form className="grid gap-4" onSubmit={form.handleSubmit(onSubmit)}>
          <div className="space-y-2">
            <Label htmlFor="receiptDate">Receipt date</Label>
            <Input
              id="receiptDate"
              type="date"
              disabled={isSubmitting}
              {...form.register("receiptDate")}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="warehouse">Warehouse</Label>
            <Input
              id="warehouse"
              disabled={isSubmitting}
              {...form.register("warehouse")}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <textarea
              id="notes"
              rows={3}
              className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex min-h-[80px] w-full rounded-md border px-3 py-2 text-sm shadow-xs focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
              disabled={isSubmitting}
              {...form.register("notes")}
            />
          </div>

          <div className="flex gap-2">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : submitLabel}
            </Button>
            {onCancel ? (
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
            ) : null}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
