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
import { GrnStatusBadge } from "@/features/goods-receipts/components/grn-status-badge";
import { canDeleteGoodsReceipt } from "@/features/goods-receipts/config/permissions";
import type { PaginatedGoodsReceipts } from "@/features/goods-receipts/types";

type GoodsReceiptsTableProps = {
  data: PaginatedGoodsReceipts;
  canManage: boolean;
  onPageChange: (page: number) => void;
  onDelete?: (id: string, receiptNumber: string) => void;
};

export function GoodsReceiptsTable({
  data,
  canManage,
  onPageChange,
  onDelete,
}: GoodsReceiptsTableProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Receipt history</CardTitle>
        <CardDescription>
          {data.total} goods receipt{data.total === 1 ? "" : "s"} found
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>GRN #</TableHead>
              <TableHead>Warehouse</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Receipt date</TableHead>
              <TableHead>Received by</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.goodsReceipts.map((grn) => (
              <TableRow key={grn.id}>
                <TableCell className="font-mono text-sm">
                  {grn.receiptNumber}
                </TableCell>
                <TableCell className="max-w-[160px] truncate">
                  {grn.warehouse ?? "—"}
                </TableCell>
                <TableCell>
                  <GrnStatusBadge status={grn.status} />
                </TableCell>
                <TableCell>
                  {new Date(grn.receiptDate).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  {grn.receivedBy.firstName} {grn.receivedBy.lastName}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <Button asChild variant="ghost" size="sm">
                      <Link href={`/dashboard/goods-receipts/${grn.id}`}>
                        <Eye className="size-4" />
                        View
                      </Link>
                    </Button>
                    {canManage && grn.status === "DRAFT" ? (
                      <Button asChild variant="ghost" size="sm">
                        <Link href={`/dashboard/goods-receipts/${grn.id}/edit`}>
                          <Pencil className="size-4" />
                          Edit
                        </Link>
                      </Button>
                    ) : null}
                    {canManage &&
                    onDelete &&
                    canDeleteGoodsReceipt(grn) ? (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => onDelete(grn.id, grn.receiptNumber)}
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
