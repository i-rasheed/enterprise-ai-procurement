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
import { RfqStatusBadge } from "@/features/rfqs/components/rfq-status-badge";
import { isClosingDatePast } from "@/features/rfqs/config/permissions";
import type { PaginatedRfqs } from "@/features/rfqs/types";

type RfqsTableProps = {
  data: PaginatedRfqs;
  canManage: boolean;
  onPageChange: (page: number) => void;
  onDelete?: (id: string, title: string) => void;
};

export function RfqsTable({
  data,
  canManage,
  onPageChange,
  onDelete,
}: RfqsTableProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Request for quotation</CardTitle>
        <CardDescription>
          {data.total} RFQ{data.total === 1 ? "" : "s"} found
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>RFQ #</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Closing date</TableHead>
              <TableHead>Vendors</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.rfqs.map((rfq) => (
              <TableRow key={rfq.id}>
                <TableCell className="font-mono text-sm">{rfq.rfqNumber}</TableCell>
                <TableCell className="max-w-[220px] truncate font-medium">
                  <Link href={`/dashboard/rfqs/${rfq.id}`} className="hover:underline">
                    {rfq.title}
                  </Link>
                </TableCell>
                <TableCell>
                  <RfqStatusBadge status={rfq.status} />
                </TableCell>
                <TableCell>
                  <span
                    className={
                      isClosingDatePast(rfq.closingDate) && rfq.status === "PUBLISHED"
                        ? "text-destructive"
                        : undefined
                    }
                  >
                    {new Date(rfq.closingDate).toLocaleDateString()}
                  </span>
                </TableCell>
                <TableCell>{rfq.vendors?.length ?? 0}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/dashboard/rfqs/${rfq.id}`}>
                        <Eye className="size-4" />
                      </Link>
                    </Button>
                    {canManage && rfq.status === "DRAFT" ? (
                      <>
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={`/dashboard/rfqs/${rfq.id}/edit`}>
                            <Pencil className="size-4" />
                          </Link>
                        </Button>
                        {onDelete ? (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onDelete(rfq.id, rfq.title)}
                          >
                            <Trash2 className="text-destructive size-4" />
                          </Button>
                        ) : null}
                      </>
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
