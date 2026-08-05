"use client";

import Link from "next/link";
import { Trophy } from "lucide-react";

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
import type { BidRankingEntry } from "@/features/bids/types";

type BidComparisonTableProps = {
  rankings: BidRankingEntry[];
};

function formatCurrency(amount: number) {
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: "USD",
  }).format(amount);
}

export function BidComparisonTable({ rankings }: BidComparisonTableProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Bid comparison</CardTitle>
        <CardDescription>
          Ranked by average evaluation score. Ties break on lower bid amount.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {rankings.length === 0 ? (
          <p className="text-muted-foreground text-sm">
            No evaluated bids yet. Score bids from their detail pages first.
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16">Rank</TableHead>
                <TableHead>Bid #</TableHead>
                <TableHead>Vendor</TableHead>
                <TableHead className="text-right">Avg score</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead className="text-right">Evaluations</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rankings.map((entry) => (
                <TableRow key={entry.bidId}>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      {entry.rank === 1 ? (
                        <Trophy className="size-4 text-amber-500" />
                      ) : null}
                      <span className="font-semibold">#{entry.rank}</span>
                    </div>
                  </TableCell>
                  <TableCell className="font-mono text-sm">
                    {entry.bidNumber}
                  </TableCell>
                  <TableCell className="font-medium">{entry.vendorName}</TableCell>
                  <TableCell className="text-right">
                    {entry.totalScore.toFixed(1)}
                  </TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(entry.totalAmount)}
                  </TableCell>
                  <TableCell className="text-right">
                    {entry.evaluationCount}
                  </TableCell>
                  <TableCell className="text-right">
                    <Link
                      href={`/dashboard/bids/${entry.bidId}`}
                      className="text-primary text-sm hover:underline"
                    >
                      View bid
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
