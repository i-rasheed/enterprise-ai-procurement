"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  awardBidSchema,
  type AwardBidFormValues,
} from "@/features/bids/schemas/bid.schema";
import { useAwardBid } from "@/features/bids/hooks/use-bids";
import type { BidRankingEntry } from "@/features/bids/types";

type AwardBidPanelProps = {
  procurementRequestId: string;
  rankings: BidRankingEntry[];
  canAward: boolean;
};

export function AwardBidPanel({
  procurementRequestId,
  rankings,
  canAward,
}: AwardBidPanelProps) {
  const awardBid = useAwardBid(procurementRequestId);

  const form = useForm<AwardBidFormValues>({
    resolver: zodResolver(awardBidSchema),
    defaultValues: {
      bidId: rankings[0]?.bidId ?? "",
      awardReason: "",
    },
  });

  useEffect(() => {
    if (rankings[0]?.bidId && !form.getValues("bidId")) {
      form.setValue("bidId", rankings[0].bidId);
    }
  }, [rankings, form]);

  const onSubmit = form.handleSubmit((values) => {
    if (
      window.confirm(
        "Award this bid? This finalizes the winning vendor for this procurement request.",
      )
    ) {
      awardBid.mutate(values);
    }
  });

  if (!canAward) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Award bid</CardTitle>
          <CardDescription>
            Only administrators can award the winning bid.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (rankings.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Award bid</CardTitle>
          <CardDescription>
            Evaluate and rank bids before awarding a winner.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Award bid</CardTitle>
        <CardDescription>
          Select the winning bid and provide a justification for the award
          decision.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="bidId">Winning bid</Label>
            <select
              id="bidId"
              className="border-input bg-background ring-offset-background focus-visible:ring-ring flex h-9 w-full rounded-md border px-3 py-1 text-sm shadow-xs focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
              disabled={awardBid.isPending}
              {...form.register("bidId")}
            >
              {rankings.map((entry) => (
                <option key={entry.bidId} value={entry.bidId}>
                  #{entry.rank} · {entry.bidNumber} · {entry.vendorName} (
                  {entry.totalScore.toFixed(1)} pts)
                </option>
              ))}
            </select>
            {form.formState.errors.bidId ? (
              <p className="text-destructive text-sm">
                {form.formState.errors.bidId.message}
              </p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="awardReason">Award reason</Label>
            <textarea
              id="awardReason"
              rows={4}
              className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex min-h-[80px] w-full rounded-md border px-3 py-2 text-sm shadow-xs focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
              placeholder="Explain why this bid was selected..."
              disabled={awardBid.isPending}
              {...form.register("awardReason")}
            />
            {form.formState.errors.awardReason ? (
              <p className="text-destructive text-sm">
                {form.formState.errors.awardReason.message}
              </p>
            ) : null}
          </div>

          <Button type="submit" disabled={awardBid.isPending}>
            {awardBid.isPending ? "Awarding..." : "Award winning bid"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
