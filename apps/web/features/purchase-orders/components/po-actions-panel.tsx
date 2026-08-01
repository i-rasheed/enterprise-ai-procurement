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
  issuePurchaseOrderSchema,
  acknowledgePurchaseOrderSchema,
  type IssuePurchaseOrderFormValues,
  type AcknowledgePurchaseOrderFormValues,
} from "@/features/purchase-orders/schemas/purchase-order.schema";
import {
  useAcknowledgePurchaseOrder,
  useCancelPurchaseOrder,
  useIssuePurchaseOrder,
} from "@/features/purchase-orders/hooks/use-purchase-orders";
import type { PurchaseOrder } from "@/features/purchase-orders/types";
import {
  canAcknowledgePurchaseOrder,
  canCancelPurchaseOrder,
  canIssuePurchaseOrder,
} from "@/features/purchase-orders/config/permissions";

type PoActionsPanelProps = {
  po: PurchaseOrder;
  canManage: boolean;
  userEmail?: string | null;
};

export function PoActionsPanel({
  po,
  canManage,
  userEmail,
}: PoActionsPanelProps) {
  const issuePo = useIssuePurchaseOrder(po.id);
  const cancelPo = useCancelPurchaseOrder(po.id);
  const acknowledgePo = useAcknowledgePurchaseOrder(po.id);

  const issueForm = useForm<IssuePurchaseOrderFormValues>({
    resolver: zodResolver(issuePurchaseOrderSchema),
    defaultValues: { issueDate: "", notes: "" },
  });

  const acknowledgeForm = useForm<AcknowledgePurchaseOrderFormValues>({
    resolver: zodResolver(acknowledgePurchaseOrderSchema),
    defaultValues: { notes: "" },
  });

  const canIssue = canManage && canIssuePurchaseOrder(po);
  const canCancel = canManage && canCancelPurchaseOrder(po);
  const canAcknowledge = canAcknowledgePurchaseOrder(po, userEmail);

  const handleIssue = issueForm.handleSubmit((values) => {
    if (
      window.confirm(
        `Issue ${po.poNumber} to ${po.vendor.name}? The PO will become read-only.`,
      )
    ) {
      issuePo.mutate(values);
    }
  });

  const handleCancel = () => {
    if (
      window.confirm(
        `Cancel ${po.poNumber}? This action cannot be undone.`,
      )
    ) {
      cancelPo.mutate();
    }
  };

  const handleAcknowledge = acknowledgeForm.handleSubmit((values) => {
    acknowledgePo.mutate(values);
  });

  if (!canIssue && !canCancel && !canAcknowledge) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Actions</CardTitle>
          <CardDescription>
            No actions available for this purchase order status.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {canIssue ? (
        <Card>
          <CardHeader>
            <CardTitle>Issue purchase order</CardTitle>
            <CardDescription>
              Send this draft PO to the vendor. Once issued, line items and
              totals cannot be changed.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleIssue} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="issueDate">Issue date (optional)</Label>
                <Input
                  id="issueDate"
                  type="date"
                  disabled={issuePo.isPending}
                  {...issueForm.register("issueDate")}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="issueNotes">Notes to vendor</Label>
                <textarea
                  id="issueNotes"
                  rows={3}
                  className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex min-h-[80px] w-full rounded-md border px-3 py-2 text-sm shadow-xs focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                  placeholder="Optional message when issuing..."
                  disabled={issuePo.isPending}
                  {...issueForm.register("notes")}
                />
              </div>
              <Button type="submit" disabled={issuePo.isPending}>
                {issuePo.isPending ? "Issuing..." : "Issue to vendor"}
              </Button>
            </form>
          </CardContent>
        </Card>
      ) : null}

      {canAcknowledge ? (
        <Card>
          <CardHeader>
            <CardTitle>Acknowledge purchase order</CardTitle>
            <CardDescription>
              Confirm receipt of this purchase order as the vendor representative.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAcknowledge} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="ackNotes">Acknowledgement notes</Label>
                <textarea
                  id="ackNotes"
                  rows={3}
                  className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex min-h-[80px] w-full rounded-md border px-3 py-2 text-sm shadow-xs focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                  placeholder="Optional delivery confirmation..."
                  disabled={acknowledgePo.isPending}
                  {...acknowledgeForm.register("notes")}
                />
              </div>
              <Button type="submit" disabled={acknowledgePo.isPending}>
                {acknowledgePo.isPending
                  ? "Acknowledging..."
                  : "Acknowledge PO"}
              </Button>
            </form>
          </CardContent>
        </Card>
      ) : null}

      {canCancel ? (
        <Card>
          <CardHeader>
            <CardTitle>Cancel purchase order</CardTitle>
            <CardDescription>
              Cancel this PO if it is no longer required.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              type="button"
              variant="destructive"
              disabled={cancelPo.isPending}
              onClick={handleCancel}
            >
              {cancelPo.isPending ? "Cancelling..." : "Cancel purchase order"}
            </Button>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
