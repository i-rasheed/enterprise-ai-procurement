"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { MatchStatusBadge } from "@/features/invoices/components/match-status-badge";
import type { MatchingResult } from "@/features/invoices/types";

type MatchingResultsPanelProps = {
  matchingResult?: MatchingResult | null;
  isLoading?: boolean;
};

export function MatchingResultsPanel({
  matchingResult,
  isLoading,
}: MatchingResultsPanelProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Matching results</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">Loading matching results...</p>
        </CardContent>
      </Card>
    );
  }

  if (!matchingResult) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Matching results</CardTitle>
          <CardDescription>
            Three-way match has not been run yet. Run matching from the actions
            panel when the invoice is submitted.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const discrepancies = matchingResult.discrepancies ?? [];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div>
            <CardTitle>Matching results</CardTitle>
            <CardDescription>
              Invoice vs purchase order vs goods receipt comparison.
            </CardDescription>
          </div>
          <MatchStatusBadge status={matchingResult.matchStatus} />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <dl className="text-muted-foreground grid gap-3 text-sm sm:grid-cols-2">
          <div>
            <dt className="font-medium text-foreground">Matched by</dt>
            <dd>
              {matchingResult.matchedBy.firstName}{" "}
              {matchingResult.matchedBy.lastName}
            </dd>
          </div>
          <div>
            <dt className="font-medium text-foreground">Matched at</dt>
            <dd>{new Date(matchingResult.matchedAt).toLocaleString()}</dd>
          </div>
        </dl>

        {discrepancies.length === 0 ? (
          <div className="bg-muted rounded-lg p-4 text-sm">
            <p className="font-medium text-emerald-700">
              All checks passed — invoice matches PO and GRN.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            <h4 className="text-sm font-semibold">Discrepancies</h4>
            <ul className="space-y-2">
              {discrepancies.map((item, index) => (
                <li
                  key={`${item.field}-${index}`}
                  className="bg-muted rounded-lg p-3 text-sm"
                >
                  <p className="font-medium capitalize">
                    {item.field.replaceAll("_", " ")}
                  </p>
                  {item.message ? (
                    <p className="text-muted-foreground mt-1">{item.message}</p>
                  ) : null}
                  {item.expected != null || item.actual != null ? (
                    <p className="text-muted-foreground mt-1 text-xs">
                      Expected: {String(item.expected ?? "—")} · Actual:{" "}
                      {String(item.actual ?? "—")}
                    </p>
                  ) : null}
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
