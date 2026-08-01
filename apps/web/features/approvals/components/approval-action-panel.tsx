"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  approveStepSchema,
  rejectStepSchema,
  type ApproveStepFormValues,
  type RejectStepFormValues,
} from "@/features/procurement/schemas/procurement.schema";

type ApprovalActionPanelProps = {
  isPending?: boolean;
  onApprove: (values: ApproveStepFormValues) => void;
  onReject: (values: RejectStepFormValues) => void;
};

export function ApprovalActionPanel({
  isPending,
  onApprove,
  onReject,
}: ApprovalActionPanelProps) {
  const [mode, setMode] = useState<"approve" | "reject" | null>(null);

  const approveForm = useForm<ApproveStepFormValues>({
    resolver: zodResolver(approveStepSchema),
    defaultValues: { comments: "" },
  });

  const rejectForm = useForm<RejectStepFormValues>({
    resolver: zodResolver(rejectStepSchema),
    defaultValues: { comments: "" },
  });

  if (!mode) {
    return (
      <div className="flex flex-wrap gap-2">
        <Button type="button" onClick={() => setMode("approve")}>
          Approve
        </Button>
        <Button type="button" variant="destructive" onClick={() => setMode("reject")}>
          Reject
        </Button>
      </div>
    );
  }

  if (mode === "approve") {
    return (
      <form
        className="space-y-3 rounded-lg border p-4"
        onSubmit={approveForm.handleSubmit((values) => {
          onApprove(values);
          approveForm.reset();
          setMode(null);
        })}
      >
        <div className="space-y-2">
          <Label htmlFor="approveComments">Approval comments (optional)</Label>
          <Input id="approveComments" {...approveForm.register("comments")} />
        </div>
        <div className="flex gap-2">
          <Button type="submit" disabled={isPending}>
            {isPending ? "Approving..." : "Confirm approve"}
          </Button>
          <Button type="button" variant="outline" onClick={() => setMode(null)}>
            Cancel
          </Button>
        </div>
      </form>
    );
  }

  return (
    <form
      className="space-y-3 rounded-lg border border-destructive/30 p-4"
      onSubmit={rejectForm.handleSubmit((values) => {
        onReject(values);
        rejectForm.reset();
        setMode(null);
      })}
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
      <div className="flex gap-2">
        <Button type="submit" variant="destructive" disabled={isPending}>
          {isPending ? "Rejecting..." : "Confirm reject"}
        </Button>
        <Button type="button" variant="outline" onClick={() => setMode(null)}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
