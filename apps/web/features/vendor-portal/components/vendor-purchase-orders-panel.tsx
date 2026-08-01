"use client";

import Link from "next/link";

import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PoStatusBadge } from "@/features/purchase-orders/components/po-status-badge";
import { formatCurrency } from "@/features/dashboard/utils/formatters";
import {
  useAcknowledgePurchaseOrder,
  useVendorPurchaseOrders,
} from "@/features/vendor-portal/hooks/use-vendor-portal";
import { useVendorContextStore } from "@/features/vendor-portal/stores/vendor-context-store";

export function VendorPurchaseOrdersPanel() {
  const vendor = useVendorContextStore((state) => state.vendor);
  const posQuery = useVendorPurchaseOrders(vendor?.id);
  const acknowledge = useAcknowledgePurchaseOrder(vendor?.id);

  const purchaseOrders = posQuery.data?.purchaseOrders ?? [];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Purchase orders</CardTitle>
        <CardDescription>
          Review issued orders and acknowledge receipt of purchase instructions.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {posQuery.isLoading ? (
          <p className="text-muted-foreground text-sm">Loading purchase orders...</p>
        ) : purchaseOrders.length === 0 ? (
          <EmptyState
            title="No purchase orders"
            description="Issued purchase orders for your vendor profile will appear here."
          />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>PO</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Expected delivery</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {purchaseOrders.map((po) => (
                <TableRow key={po.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{po.poNumber}</p>
                      <p className="text-muted-foreground text-xs">
                        {po.vendor.name}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <PoStatusBadge status={po.status} />
                  </TableCell>
                  <TableCell>{formatCurrency(po.totalAmount)}</TableCell>
                  <TableCell className="text-sm">
                    {po.expectedDeliveryDate
                      ? new Date(po.expectedDeliveryDate).toLocaleDateString()
                      : "—"}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      {po.status === "ISSUED" ? (
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          disabled={acknowledge.isPending}
                          onClick={() =>
                            acknowledge.mutate({
                              id: po.id,
                              notes: "Acknowledged via vendor portal",
                            })
                          }
                        >
                          Acknowledge
                        </Button>
                      ) : null}
                      <Link
                        href={`/vendor/purchase-orders/${po.id}`}
                        className="text-primary inline-flex items-center text-sm font-medium hover:underline"
                      >
                        View
                      </Link>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
