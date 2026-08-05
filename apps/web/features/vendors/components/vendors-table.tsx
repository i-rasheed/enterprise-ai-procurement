"use client";

import Link from "next/link";
import { Eye, Trash2 } from "lucide-react";

import { TablePagination } from "@/components/shared/table-pagination";
import { Badge } from "@/components/ui/badge";
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
  ComplianceStatusBadge,
  VendorStatusBadge,
} from "@/features/vendors/components/vendor-status-badge";
import type { PaginatedVendors } from "@/features/vendors/types";

type VendorsTableProps = {
  data: PaginatedVendors;
  canManage: boolean;
  onPageChange: (page: number) => void;
  onDelete?: (id: string, name: string) => void;
};

export function VendorsTable({
  data,
  canManage,
  onPageChange,
  onDelete,
}: VendorsTableProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Vendor directory</CardTitle>
        <CardDescription>
          {data.total} vendor{data.total === 1 ? "" : "s"} found
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Compliance</TableHead>
              <TableHead>Rating</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.vendors.map((vendor) => (
              <TableRow key={vendor.id}>
                <TableCell className="font-medium">
                  <Link
                    href={`/dashboard/vendors/${vendor.id}`}
                    className="hover:underline"
                  >
                    {vendor.name}
                  </Link>
                </TableCell>
                <TableCell>{vendor.email}</TableCell>
                <TableCell>{vendor.category ?? "—"}</TableCell>
                <TableCell>
                  <VendorStatusBadge status={vendor.status} />
                </TableCell>
                <TableCell>
                  <ComplianceStatusBadge status={vendor.complianceStatus} />
                </TableCell>
                <TableCell>
                  {vendor.rating != null ? (
                    <Badge variant="outline">{vendor.rating.toFixed(1)}</Badge>
                  ) : (
                    "—"
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/dashboard/vendors/${vendor.id}`}>
                        <Eye className="size-4" />
                        <span className="sr-only">View</span>
                      </Link>
                    </Button>
                    {canManage && onDelete ? (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onDelete(vendor.id, vendor.name)}
                      >
                        <Trash2 className="text-destructive size-4" />
                        <span className="sr-only">Delete</span>
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
