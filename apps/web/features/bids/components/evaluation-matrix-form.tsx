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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  calculateTotalScore,
  evaluationSchema,
  type EvaluationFormValues,
} from "@/features/bids/schemas/bid.schema";
import { EVALUATION_CRITERIA } from "@/features/bids/types";
import { useCreateEvaluation } from "@/features/bids/hooks/use-bids";

type EvaluationMatrixFormProps = {
  bidId: string;
  canEvaluate: boolean;
  disabled?: boolean;
};

export function EvaluationMatrixForm({
  bidId,
  canEvaluate,
  disabled,
}: EvaluationMatrixFormProps) {
  const createEvaluation = useCreateEvaluation(bidId);

  const form = useForm<EvaluationFormValues>({
    resolver: zodResolver(evaluationSchema),
    defaultValues: {
      bidId,
      technicalScore: 0,
      commercialScore: 0,
      complianceScore: 0,
      deliveryScore: 0,
      comments: "",
    },
  });

  useEffect(() => {
    form.setValue("bidId", bidId);
  }, [bidId, form]);

  const scores = form.watch([
    "technicalScore",
    "commercialScore",
    "complianceScore",
    "deliveryScore",
  ]);
  const totalScore = calculateTotalScore({
    technicalScore: scores[0],
    commercialScore: scores[1],
    complianceScore: scores[2],
    deliveryScore: scores[3],
  });

  const onSubmit = form.handleSubmit((values) => {
    createEvaluation.mutate(values);
    form.reset({
      ...values,
      comments: "",
    });
  });

  if (!canEvaluate) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Evaluation matrix</CardTitle>
          <CardDescription>
            Only procurement managers and admins can score bids.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Evaluation matrix</CardTitle>
        <CardDescription>
          Score each criterion from 0–100. Total score is the sum of all four
          dimensions (max 400).
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2">
            {EVALUATION_CRITERIA.map((criterion) => (
              <div key={criterion.key} className="space-y-2">
                <Label htmlFor={criterion.key}>{criterion.label}</Label>
                <Input
                  id={criterion.key}
                  type="number"
                  min={0}
                  max={100}
                  disabled={disabled || createEvaluation.isPending}
                  {...form.register(criterion.key, { valueAsNumber: true })}
                />
                {form.formState.errors[criterion.key] ? (
                  <p className="text-destructive text-sm">
                    {form.formState.errors[criterion.key]?.message}
                  </p>
                ) : null}
              </div>
            ))}
          </div>

          <div className="bg-muted rounded-lg p-4">
            <p className="text-sm font-medium">Total score</p>
            <p className="text-2xl font-semibold">{totalScore} / 400</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="comments">Comments</Label>
            <textarea
              id="comments"
              rows={3}
              className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex min-h-[80px] w-full rounded-md border px-3 py-2 text-sm shadow-xs focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
              placeholder="Optional evaluation notes..."
              disabled={disabled || createEvaluation.isPending}
              {...form.register("comments")}
            />
          </div>

          <Button
            type="submit"
            disabled={disabled || createEvaluation.isPending}
          >
            {createEvaluation.isPending ? "Saving..." : "Submit evaluation"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
