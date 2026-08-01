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
import {
  ProcurementPriorityBadge,
  ProcurementStatusBadge,
} from "@/features/procurement/components/procurement-status-badge";
import type { PaginatedProcurementRequests } from "@/features/procurement/types";
import { formatCurrency } from "@/features/procurement/utils/formatters";

type ProcurementRequestsTableProps = {
  data: PaginatedProcurementRequests;
  onPageChange: (page: number) => void;
  onDelete?: (id: string, title: string) => void;
};

export function ProcurementRequestsTable({
  data,
  onPageChange,
  onDelete,
}: ProcurementRequestsTableProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Procurement requests</CardTitle>
        <CardDescription>
          {data.total} request{data.total === 1 ? "" : "s"} found
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Department</TableHead>
              <TableHead>Priority</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Budget</TableHead>
              <TableHead>Requester</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.requests.map((request) => (
              <TableRow key={request.id}>
                <TableCell className="max-w-[220px] truncate font-medium">
                  <Link
                    href={`/dashboard/procurement/${request.id}`}
                    className="hover:underline"
                  >
                    {request.title}
                  </Link>
                </TableCell>
                <TableCell>{request.department}</TableCell>
                <TableCell>
                  <ProcurementPriorityBadge priority={request.priority} />
                </TableCell>
                <TableCell>
                  <ProcurementStatusBadge status={request.status} />
                </TableCell>
                <TableCell>
                  {formatCurrency(request.estimatedBudget, request.currency)}
                </TableCell>
                <TableCell>
                  {request.requester.firstName} {request.requester.lastName}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/dashboard/procurement/${request.id}`}>
                        <Eye className="size-4" />
                        <span className="sr-only">View</span>
                      </Link>
                    </Button>
                    {request.status === "DRAFT" ? (
                      <>
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={`/dashboard/procurement/${request.id}/edit`}>
                            <Pencil className="size-4" />
                            <span className="sr-only">Edit</span>
                          </Link>
                        </Button>
                        {onDelete ? (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onDelete(request.id, request.title)}
                          >
                            <Trash2 className="text-destructive size-4" />
                            <span className="sr-only">Delete</span>
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
