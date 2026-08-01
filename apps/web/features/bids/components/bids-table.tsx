"use client";

import Link from "next/link";
import { BarChart3, Eye } from "lucide-react";

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
import { BidStatusBadge } from "@/features/bids/components/bid-status-badge";
import type { PaginatedBids } from "@/features/bids/types";

type BidsTableProps = {
  data: PaginatedBids;
  onPageChange: (page: number) => void;
};

function formatCurrency(amount: number, currency: string) {
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency,
  }).format(amount);
}

export function BidsTable({ data, onPageChange }: BidsTableProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Vendor bids</CardTitle>
        <CardDescription>
          {data.total} bid{data.total === 1 ? "" : "s"} found
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Bid #</TableHead>
              <TableHead>Vendor</TableHead>
              <TableHead>RFQ</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Submitted</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.bids.map((bid) => (
              <TableRow key={bid.id}>
                <TableCell className="font-mono text-sm">{bid.bidNumber}</TableCell>
                <TableCell className="max-w-[180px] truncate font-medium">
                  {bid.vendor.name}
                </TableCell>
                <TableCell className="max-w-[180px] truncate">
                  <Link
                    href={`/dashboard/rfqs/${bid.rfqId}`}
                    className="hover:underline"
                  >
                    {bid.rfq.rfqNumber}
                  </Link>
                </TableCell>
                <TableCell>
                  <BidStatusBadge status={bid.status} />
                </TableCell>
                <TableCell>
                  {formatCurrency(bid.totalAmount, bid.currency)}
                </TableCell>
                <TableCell>
                  {bid.submittedAt
                    ? new Date(bid.submittedAt).toLocaleDateString()
                    : "—"}
                </TableCell>
                <TableCell className="text-right">
                  <Button asChild variant="ghost" size="sm">
                    <Link href={`/dashboard/bids/${bid.id}`}>
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

export function BidsCompareLink({ procurementRequestId }: { procurementRequestId: string }) {
  return (
    <Button asChild variant="outline" size="sm">
      <Link href={`/dashboard/bids/compare/${procurementRequestId}`}>
        <BarChart3 className="size-4" />
        Compare & award
      </Link>
    </Button>
  );
}
