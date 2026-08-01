"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { Badge } from "@/components/ui/badge";
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
  approveStepSchema,
  rejectStepSchema,
  type ApproveStepFormValues,
  type RejectStepFormValues,
} from "@/features/procurement/schemas/procurement.schema";
import {
  useApproveWorkflow,
  useRejectWorkflow,
} from "@/features/procurement/hooks/use-procurement";
import type { ApprovalHistory } from "@/features/procurement/types";
import { formatApprovalRole } from "@/features/procurement/utils/formatters";
import { useAuthStore } from "@/stores/auth-store";

type ApprovalStatusPanelProps = {
  requestId: string;
  history?: ApprovalHistory | null;
  isLoading?: boolean;
};

export function ApprovalStatusPanel({
  requestId,
  history,
  isLoading,
}: ApprovalStatusPanelProps) {
  const user = useAuthStore((state) => state.user);
  const approveWorkflow = useApproveWorkflow(requestId);
  const rejectWorkflow = useRejectWorkflow(requestId);

  const approveForm = useForm<ApproveStepFormValues>({
    resolver: zodResolver(approveStepSchema),
    defaultValues: { comments: "" },
  });

  const rejectForm = useForm<RejectStepFormValues>({
    resolver: zodResolver(rejectStepSchema),
    defaultValues: { comments: "" },
  });

  const workflow = history?.workflow;
  const currentStep = workflow?.steps.find(
    (step) => step.level === workflow.currentLevel,
  );

  const canAct =
    workflow?.status === "IN_PROGRESS" &&
    currentStep?.status === "PENDING" &&
    (currentStep.approver.id === user?.id || user?.role === "ADMIN");

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Approval status</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">Loading approval workflow...</p>
        </CardContent>
      </Card>
    );
  }

  if (!workflow) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Approval status</CardTitle>
          <CardDescription>
            Approval workflow starts when the request is submitted.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">
            No approval workflow yet.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Approval status</CardTitle>
        <CardDescription>
          Level {workflow.currentLevel} of {workflow.steps.length} ·{" "}
          {workflow.status.replace("_", " ").toLowerCase()}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          {workflow.steps.map((step) => (
            <div
              key={step.id}
              className="flex flex-col gap-2 rounded-lg border p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <p className="font-medium">
                  Level {step.level}: {formatApprovalRole(step.role)}
                </p>
                <p className="text-muted-foreground text-sm">
                  {step.approver.firstName} {step.approver.lastName}
                </p>
                {step.comments ? (
                  <p className="mt-1 text-sm">{step.comments}</p>
                ) : null}
              </div>
              <Badge
                variant={
                  step.status === "APPROVED"
                    ? "secondary"
                    : step.status === "REJECTED"
                      ? "destructive"
                      : "outline"
                }
              >
                {step.status.toLowerCase()}
              </Badge>
            </div>
          ))}
        </div>

        {canAct && currentStep ? (
          <div className="space-y-4 rounded-lg border border-dashed p-4">
            <p className="text-sm font-medium">Your approval action</p>
            <form
              className="space-y-3"
              onSubmit={approveForm.handleSubmit((values) =>
                approveWorkflow.mutate(
                  { workflowId: workflow.id, values },
                  { onSuccess: () => approveForm.reset() },
                ),
              )}
            >
              <div className="space-y-2">
                <Label htmlFor="approveComments">Approval comments (optional)</Label>
                <Input id="approveComments" {...approveForm.register("comments")} />
              </div>
              <Button type="submit" disabled={approveWorkflow.isPending}>
                {approveWorkflow.isPending ? "Approving..." : "Approve"}
              </Button>
            </form>

            <form
              className="space-y-3 border-t pt-4"
              onSubmit={rejectForm.handleSubmit((values) =>
                rejectWorkflow.mutate(
                  { workflowId: workflow.id, values },
                  { onSuccess: () => rejectForm.reset() },
                ),
              )}
            >
              <div className="space-y-2">
                <Label htmlFor="rejectComments">Rejection reason</Label>
                <Input id="rejectComments" {...rejectForm.register("comments")} />
                {rejectForm.formState.errors.comments ? (
                  <p className="text-destructive text-sm">
                    {rejectForm.formState.errors.comments.message}
                  </p>
                ) : null}
              </div>
              <Button
                type="submit"
                variant="destructive"
                disabled={rejectWorkflow.isPending}
              >
                {rejectWorkflow.isPending ? "Rejecting..." : "Reject"}
              </Button>
            </form>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
