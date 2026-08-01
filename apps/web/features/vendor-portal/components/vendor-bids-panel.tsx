"use client";

import Link from "next/link";

import { EmptyState } from "@/components/shared/empty-state";
import { Badge } from "@/components/ui/badge";
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
import { formatCurrency } from "@/features/dashboard/utils/formatters";
import { useVendorBids } from "@/features/vendor-portal/hooks/use-vendor-portal";
import { useVendorContextStore } from "@/features/vendor-portal/stores/vendor-context-store";

export function VendorBidsPanel() {
  const vendor = useVendorContextStore((state) => state.vendor);
  const bidsQuery = useVendorBids(vendor?.id);

  const bids = bidsQuery.data?.bids ?? [];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Bids</CardTitle>
        <CardDescription>
          Track draft, submitted, and awarded bids for your vendor profile.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {bidsQuery.isLoading ? (
          <p className="text-muted-foreground text-sm">Loading bids...</p>
        ) : bids.length === 0 ? (
          <EmptyState
            title="No bids yet"
            description="Submit a bid from an invited RFQ to begin."
            action={{ label: "View RFQs", href: "/vendor/rfqs" }}
          />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Bid</TableHead>
                <TableHead>RFQ</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Total</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {bids.map((bid) => (
                <TableRow key={bid.id}>
                  <TableCell className="font-medium">{bid.bidNumber}</TableCell>
                  <TableCell>{bid.rfq.title}</TableCell>
                  <TableCell>
                    <BidStatusBadge status={bid.status} />
                  </TableCell>
                  <TableCell>{formatCurrency(bid.totalAmount)}</TableCell>
                  <TableCell className="text-right">
                    <Link
                      href={`/vendor/bids/${bid.id}`}
                      className="text-primary text-sm font-medium hover:underline"
                    >
                      View
                    </Link>
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
