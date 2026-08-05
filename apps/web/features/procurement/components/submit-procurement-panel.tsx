"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  submitProcurementSchema,
  type SubmitProcurementFormValues,
} from "@/features/procurement/schemas/procurement.schema";
import { useSubmitProcurementRequest } from "@/features/procurement/hooks/use-procurement";
import type { ProcurementRequest } from "@/features/procurement/types";
import {
  canSubmitRequest,
  formatCurrency,
} from "@/features/procurement/utils/formatters";

type SubmitProcurementPanelProps = {
  request: ProcurementRequest;
};

export function SubmitProcurementPanel({ request }: SubmitProcurementPanelProps) {
  const submitRequest = useSubmitProcurementRequest(request.id);

  const form = useForm<SubmitProcurementFormValues>({
    resolver: zodResolver(submitProcurementSchema),
    defaultValues: { submissionNote: "" },
  });

  const totalCost =
    request.totalCost ??
    request.items.reduce((sum, item) => sum + item.totalPrice, 0);

  const budgetMatches =
    Math.abs(totalCost - request.estimatedBudget) < 0.01 && request.items.length > 0;

  if (!canSubmitRequest(request)) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Submit for approval</CardTitle>
        <CardDescription>
          Submit this draft to start the multi-level approval workflow.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="rounded-lg bg-muted/50 p-4 text-sm">
          <p>
            Line item total:{" "}
            <strong>{formatCurrency(totalCost, request.currency)}</strong>
          </p>
          <p>
            Estimated budget:{" "}
            <strong>
              {formatCurrency(request.estimatedBudget, request.currency)}
            </strong>
          </p>
          {!budgetMatches ? (
            <p className="text-destructive mt-2">
              Line item total must match the estimated budget before submission.
            </p>
          ) : null}
        </div>

        <form
          className="space-y-4"
          onSubmit={form.handleSubmit((values) => submitRequest.mutate(values))}
        >
          <div className="space-y-2">
            <Label htmlFor="submissionNote">Submission note (optional)</Label>
            <Input
              id="submissionNote"
              placeholder="Ready for procurement review"
              {...form.register("submissionNote")}
            />
          </div>
          <Button
            type="submit"
            disabled={!budgetMatches || submitRequest.isPending}
          >
            {submitRequest.isPending ? "Submitting..." : "Submit request"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
