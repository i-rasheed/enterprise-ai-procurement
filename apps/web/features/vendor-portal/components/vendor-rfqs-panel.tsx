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
import { useVendorRfqs } from "@/features/vendor-portal/hooks/use-vendor-portal";
import { useVendorContextStore } from "@/features/vendor-portal/stores/vendor-context-store";

export function VendorRfqsPanel() {
  const vendor = useVendorContextStore((state) => state.vendor);
  const rfqsQuery = useVendorRfqs(vendor?.id);

  if (rfqsQuery.isLoading) {
    return <p className="text-muted-foreground text-sm">Loading RFQs...</p>;
  }

  const rfqs = rfqsQuery.data ?? [];

  return (
    <Card>
      <CardHeader>
        <CardTitle>RFQ invitations</CardTitle>
        <CardDescription>
          Published requests where your company has been invited to bid.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {rfqs.length === 0 ? (
          <EmptyState
            title="No RFQ invitations"
            description="When procurement teams invite your vendor profile to an RFQ, it will appear here."
          />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>RFQ</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Closing</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rfqs.map((rfq) => (
                <TableRow key={rfq.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{rfq.title}</p>
                      <p className="text-muted-foreground text-xs">
                        {rfq.rfqNumber}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{rfq.status}</Badge>
                  </TableCell>
                  <TableCell className="text-sm">
                    {new Date(rfq.closingDate).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <Link
                      href={`/vendor/rfqs/${rfq.id}`}
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
