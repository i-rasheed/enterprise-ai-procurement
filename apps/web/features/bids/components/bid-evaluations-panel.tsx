"use client";

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
import { EVALUATION_CRITERIA } from "@/features/bids/types";
import type { BidEvaluationList } from "@/features/bids/types";

type BidEvaluationsPanelProps = {
  data?: BidEvaluationList | null;
  isLoading?: boolean;
};

export function BidEvaluationsPanel({
  data,
  isLoading,
}: BidEvaluationsPanelProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Evaluation history</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">Loading evaluations...</p>
        </CardContent>
      </Card>
    );
  }

  const evaluations = data?.evaluations ?? [];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Evaluation history</CardTitle>
        <CardDescription>
          {evaluations.length === 0
            ? "No evaluations yet."
            : `${evaluations.length} evaluation${evaluations.length === 1 ? "" : "s"} · Average total: ${data?.averageTotalScore.toFixed(1) ?? 0}`}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {evaluations.length === 0 ? (
          <p className="text-muted-foreground text-sm">
            Submit a score using the evaluation matrix above.
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Evaluator</TableHead>
                {EVALUATION_CRITERIA.map((criterion) => (
                  <TableHead key={criterion.key} className="text-right">
                    {criterion.label}
                  </TableHead>
                ))}
                <TableHead className="text-right">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {evaluations.map((evaluation) => (
                <TableRow key={evaluation.id}>
                  <TableCell>
                    <div className="font-medium">
                      {evaluation.evaluator.firstName}{" "}
                      {evaluation.evaluator.lastName}
                    </div>
                    <div className="text-muted-foreground text-xs">
                      {evaluation.evaluator.email}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    {evaluation.technicalScore}
                  </TableCell>
                  <TableCell className="text-right">
                    {evaluation.commercialScore}
                  </TableCell>
                  <TableCell className="text-right">
                    {evaluation.complianceScore}
                  </TableCell>
                  <TableCell className="text-right">
                    {evaluation.deliveryScore}
                  </TableCell>
                  <TableCell className="text-right font-semibold">
                    {evaluation.totalScore}
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
