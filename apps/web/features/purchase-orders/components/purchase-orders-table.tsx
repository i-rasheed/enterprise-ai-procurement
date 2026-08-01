"use client";

import Link from "next/link";
import { Eye, Pencil, Trash2 } from "lucide-react";

import { TablePagination } from "@/components/shared/table-pagination";
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
import { canDeletePurchaseOrder } from "@/features/purchase-orders/config/permissions";
import type { PaginatedPurchaseOrders } from "@/features/purchase-orders/types";

type PurchaseOrdersTableProps = {
  data: PaginatedPurchaseOrders;
  canManage: boolean;
  onPageChange: (page: number) => void;
  onDelete?: (id: string, poNumber: string) => void;
};

function formatCurrency(amount: number, currency: string) {
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency,
  }).format(amount);
}

export function PurchaseOrdersTable({
  data,
  canManage,
  onPageChange,
  onDelete,
}: PurchaseOrdersTableProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Purchase orders</CardTitle>
        <CardDescription>
          {data.total} purchase order{data.total === 1 ? "" : "s"} found
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>PO #</TableHead>
              <TableHead>Vendor</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Expected delivery</TableHead>
              <TableHead>Total</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.purchaseOrders.map((po) => (
              <TableRow key={po.id}>
                <TableCell className="font-mono text-sm">{po.poNumber}</TableCell>
                <TableCell className="max-w-[180px] truncate font-medium">
                  {po.vendor.name}
                </TableCell>
                <TableCell>
                  <PoStatusBadge status={po.status} />
                </TableCell>
                <TableCell>
                  {new Date(po.expectedDeliveryDate).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  {formatCurrency(po.totalAmount, po.currency)}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <Button asChild variant="ghost" size="sm">
                      <Link href={`/dashboard/purchase-orders/${po.id}`}>
                        <Eye className="size-4" />
                        View
                      </Link>
                    </Button>
                    {canManage && po.status === "DRAFT" ? (
                      <Button asChild variant="ghost" size="sm">
                        <Link href={`/dashboard/purchase-orders/${po.id}/edit`}>
                          <Pencil className="size-4" />
                          Edit
                        </Link>
                      </Button>
                    ) : null}
                    {canManage &&
                    onDelete &&
                    canDeletePurchaseOrder(po) ? (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => onDelete(po.id, po.poNumber)}
                      >
                        <Trash2 className="size-4" />
                        Delete
                      </Button>
                    ) : null}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        <TablePagination
          page={data.page}
          totalPages={data.totalPages}
          total={data.total}
          limit={data.limit}
          onPageChange={onPageChange}
        />
      </CardContent>
    </Card>
  );
}
