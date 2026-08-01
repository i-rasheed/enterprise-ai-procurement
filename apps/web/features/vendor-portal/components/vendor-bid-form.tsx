"use client";

import Link from "next/link";
import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  vendorBidSchema,
  type VendorBidFormValues,
} from "@/features/vendor-portal/schemas/vendor-portal.schema";
import { useSubmitVendorBid } from "@/features/vendor-portal/hooks/use-vendor-portal";
import { useVendorContextStore } from "@/features/vendor-portal/stores/vendor-context-store";

type VendorBidFormProps = {
  rfqId: string;
  rfqTitle: string;
};

export function VendorBidForm({ rfqId, rfqTitle }: VendorBidFormProps) {
  const vendor = useVendorContextStore((state) => state.vendor);
  const submitBid = useSubmitVendorBid(vendor?.id);

  const form = useForm<VendorBidFormValues>({
    resolver: zodResolver(vendorBidSchema),
    defaultValues: {
      rfqId,
      currency: "USD",
      deliveryPeriod: "",
      paymentTerms: "Net 30",
      warrantyPeriod: "",
      notes: "",
      items: [{ description: "", quantity: 1, unitPrice: 0 }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items",
  });

  return (
    <form
      className="space-y-6"
      onSubmit={form.handleSubmit((values) => submitBid.mutate(values))}
    >
      <div>
        <h3 className="text-lg font-semibold">Submit bid for {rfqTitle}</h3>
        <p className="text-muted-foreground text-sm">
          Provide commercial terms and line items for your proposal.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="currency">Currency</Label>
          <Input id="currency" {...form.register("currency")} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="deliveryPeriod">Delivery period</Label>
          <Input id="deliveryPeriod" {...form.register("deliveryPeriod")} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="paymentTerms">Payment terms</Label>
          <Input id="paymentTerms" {...form.register("paymentTerms")} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="warrantyPeriod">Warranty</Label>
          <Input id="warrantyPeriod" {...form.register("warrantyPeriod")} />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Notes</Label>
        <Input id="notes" {...form.register("notes")} />
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label>Line items</Label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() =>
              append({ description: "", quantity: 1, unitPrice: 0 })
            }
          >
            <Plus className="size-4" />
            Add item
          </Button>
        </div>

        {fields.map((field, index) => (
          <div
            key={field.id}
            className="grid gap-3 rounded-lg border p-4 md:grid-cols-[minmax(0,1fr)_120px_120px_auto]"
          >
            <Input
              placeholder="Description"
              {...form.register(`items.${index}.description`)}
            />
            <Input
              type="number"
              placeholder="Qty"
              {...form.register(`items.${index}.quantity`, {
                valueAsNumber: true,
              })}
            />
            <Input
              type="number"
              step="0.01"
              placeholder="Unit price"
              {...form.register(`items.${index}.unitPrice`, {
                valueAsNumber: true,
              })}
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              disabled={fields.length === 1}
              onClick={() => remove(index)}
            >
              <Trash2 className="size-4" />
            </Button>
          </div>
        ))}
      </div>

      <div className="flex gap-3">
        <Button type="submit" disabled={submitBid.isPending}>
          {submitBid.isPending ? "Submitting..." : "Submit bid"}
        </Button>
        <Button type="button" variant="outline" asChild>
          <Link href="/vendor/bids">Cancel</Link>
        </Button>
      </div>
    </form>
  );
}
