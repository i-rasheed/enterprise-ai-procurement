"use client";

import Link from "next/link";
import { Eye } from "lucide-react";

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
import { InvoiceStatusBadge } from "@/features/invoices/components/invoice-status-badge";
import { MatchStatusBadge } from "@/features/invoices/components/match-status-badge";
import type { PaginatedInvoices } from "@/features/invoices/types";

type InvoicesTableProps = {
  data: PaginatedInvoices;
  onPageChange: (page: number) => void;
};

function formatCurrency(amount: number, currency: string) {
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency,
  }).format(amount);
}

export function InvoicesTable({ data, onPageChange }: InvoicesTableProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Invoices</CardTitle>
        <CardDescription>
          {data.total} invoice{data.total === 1 ? "" : "s"} found
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Invoice #</TableHead>
              <TableHead>Vendor</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Match</TableHead>
              <TableHead>Due date</TableHead>
              <TableHead>Total</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.invoices.map((invoice) => (
              <TableRow key={invoice.id}>
                <TableCell className="font-mono text-sm">
                  {invoice.invoiceNumber}
                </TableCell>
                <TableCell className="max-w-[180px] truncate font-medium">
                  {invoice.vendor.name}
                </TableCell>
                <TableCell>
                  <InvoiceStatusBadge status={invoice.status} />
                </TableCell>
                <TableCell>
                  {invoice.matchingResult ? (
                    <MatchStatusBadge
                      status={invoice.matchingResult.matchStatus}
                    />
                  ) : (
                    "—"
                  )}
                </TableCell>
                <TableCell>
                  {new Date(invoice.dueDate).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  {formatCurrency(invoice.totalAmount, invoice.currency)}
                </TableCell>
                <TableCell className="text-right">
                  <Button asChild variant="ghost" size="sm">
                    <Link href={`/dashboard/invoices/${invoice.id}`}>
                      <Eye className="size-4" />
                      View
                    </Link>
                  </Button>
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
