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
  createPurchaseOrderSchema,
  updatePurchaseOrderSchema,
  type CreatePurchaseOrderFormValues,
  type UpdatePurchaseOrderFormValues,
} from "@/features/purchase-orders/schemas/purchase-order.schema";
import type { PurchaseOrder } from "@/features/purchase-orders/types";

export type AwardOption = {
  id: string;
  bidId: string;
  label: string;
};

type PoCreateFormProps = {
  awards: AwardOption[];
  submitLabel: string;
  isSubmitting?: boolean;
  onSubmit: (values: CreatePurchaseOrderFormValues) => void;
  onCancel?: () => void;
};

export function PoCreateForm({
  awards,
  submitLabel,
  isSubmitting,
  onSubmit,
  onCancel,
}: PoCreateFormProps) {
  const form = useForm<CreatePurchaseOrderFormValues>({
    resolver: zodResolver(createPurchaseOrderSchema),
    defaultValues: {
      awardId: awards[0]?.id ?? "",
      expectedDeliveryDate: "",
      deliveryAddress: "",
      notes: "",
    },
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create purchase order</CardTitle>
        <CardDescription>
          Generate a draft PO from an awarded bid. Line items are copied from
          the winning bid.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form
          className="grid gap-4"
          onSubmit={form.handleSubmit(onSubmit)}
        >
          <div className="space-y-2">
            <Label htmlFor="awardId">Award</Label>
            <select
              id="awardId"
              className="border-input bg-background ring-offset-background focus-visible:ring-ring flex h-9 w-full rounded-md border px-3 py-1 text-sm shadow-xs focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
              disabled={isSubmitting || awards.length === 0}
              {...form.register("awardId")}
            >
              {awards.length === 0 ? (
                <option value="">No available awards</option>
              ) : (
                awards.map((award) => (
                  <option key={award.id} value={award.id}>
                    {award.label}
                  </option>
                ))
              )}
            </select>
            {form.formState.errors.awardId ? (
              <p className="text-destructive text-sm">
                {form.formState.errors.awardId.message}
              </p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="expectedDeliveryDate">Expected delivery date</Label>
            <Input
              id="expectedDeliveryDate"
              type="date"
              disabled={isSubmitting}
              {...form.register("expectedDeliveryDate")}
            />
            {form.formState.errors.expectedDeliveryDate ? (
              <p className="text-destructive text-sm">
                {form.formState.errors.expectedDeliveryDate.message}
              </p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="deliveryAddress">Delivery address</Label>
            <Input
              id="deliveryAddress"
              placeholder="123 Procurement Way, Suite 400"
              disabled={isSubmitting}
              {...form.register("deliveryAddress")}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <textarea
              id="notes"
              rows={3}
              className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex min-h-[80px] w-full rounded-md border px-3 py-2 text-sm shadow-xs focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
              placeholder="Delivery instructions..."
              disabled={isSubmitting}
              {...form.register("notes")}
            />
          </div>

          <div className="flex gap-2">
            <Button type="submit" disabled={isSubmitting || awards.length === 0}>
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

type PoEditFormProps = {
  po: PurchaseOrder;
  submitLabel: string;
  isSubmitting?: boolean;
  onSubmit: (values: UpdatePurchaseOrderFormValues) => void;
  onCancel?: () => void;
};

export function PoEditForm({
  po,
  submitLabel,
  isSubmitting,
  onSubmit,
  onCancel,
}: PoEditFormProps) {
  const form = useForm<UpdatePurchaseOrderFormValues>({
    resolver: zodResolver(updatePurchaseOrderSchema),
    values: {
      expectedDeliveryDate: po.expectedDeliveryDate.slice(0, 10),
      paymentTerms: po.paymentTerms ?? "",
      deliveryAddress: po.deliveryAddress ?? "",
      notes: po.notes ?? "",
    },
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Edit draft purchase order</CardTitle>
        <CardDescription>
          Update delivery details for {po.poNumber}. Line items cannot be
          changed after creation.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form
          className="grid gap-4"
          onSubmit={form.handleSubmit(onSubmit)}
        >
          <div className="space-y-2">
            <Label htmlFor="expectedDeliveryDate">Expected delivery date</Label>
            <Input
              id="expectedDeliveryDate"
              type="date"
              disabled={isSubmitting}
              {...form.register("expectedDeliveryDate")}
            />
            {form.formState.errors.expectedDeliveryDate ? (
              <p className="text-destructive text-sm">
                {form.formState.errors.expectedDeliveryDate.message}
              </p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="paymentTerms">Payment terms</Label>
            <Input
              id="paymentTerms"
              placeholder="Net 30"
              disabled={isSubmitting}
              {...form.register("paymentTerms")}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="deliveryAddress">Delivery address</Label>
            <Input
              id="deliveryAddress"
              disabled={isSubmitting}
              {...form.register("deliveryAddress")}
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
