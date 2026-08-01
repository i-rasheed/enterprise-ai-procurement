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
  procurementRequestSchema,
  type ProcurementRequestFormValues,
} from "@/features/procurement/schemas/procurement.schema";
import type { ProcurementRequest } from "@/features/procurement/types";

type ProcurementRequestFormProps = {
  request?: ProcurementRequest;
  submitLabel: string;
  isSubmitting?: boolean;
  onSubmit: (values: ProcurementRequestFormValues) => void;
  onCancel?: () => void;
};

function toFormValues(request?: ProcurementRequest): ProcurementRequestFormValues {
  if (!request) {
    return {
      title: "",
      description: "",
      justification: "",
      department: "",
      estimatedBudget: 0,
      currency: "USD",
      priority: "MEDIUM",
      requiredDeliveryDate: "",
    };
  }

  return {
    title: request.title,
    description: request.description,
    justification: request.justification,
    department: request.department,
    estimatedBudget: request.estimatedBudget,
    currency: request.currency,
    priority: request.priority,
    requiredDeliveryDate: request.requiredDeliveryDate.slice(0, 10),
  };
}

export function ProcurementRequestForm({
  request,
  submitLabel,
  isSubmitting,
  onSubmit,
  onCancel,
}: ProcurementRequestFormProps) {
  const form = useForm<ProcurementRequestFormValues>({
    resolver: zodResolver(procurementRequestSchema),
    values: toFormValues(request),
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {request ? "Edit procurement request" : "Create procurement request"}
        </CardTitle>
        <CardDescription>
          {request
            ? "Update draft request details before submission."
            : "Start a new purchase request. Add line items after saving the draft."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form
          className="grid gap-4 md:grid-cols-2"
          onSubmit={form.handleSubmit(onSubmit)}
        >
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="title">Title</Label>
            <Input id="title" {...form.register("title")} />
            {form.formState.errors.title ? (
              <p className="text-destructive text-sm">
                {form.formState.errors.title.message}
              </p>
            ) : null}
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="description">Description</Label>
            <textarea
              id="description"
              rows={3}
              className="border-input bg-background flex w-full rounded-md border px-3 py-2 text-sm"
              {...form.register("description")}
            />
            {form.formState.errors.description ? (
              <p className="text-destructive text-sm">
                {form.formState.errors.description.message}
              </p>
            ) : null}
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="justification">Business justification</Label>
            <textarea
              id="justification"
              rows={3}
              className="border-input bg-background flex w-full rounded-md border px-3 py-2 text-sm"
              {...form.register("justification")}
            />
            {form.formState.errors.justification ? (
              <p className="text-destructive text-sm">
                {form.formState.errors.justification.message}
              </p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="department">Department</Label>
            <Input id="department" {...form.register("department")} />
            {form.formState.errors.department ? (
              <p className="text-destructive text-sm">
                {form.formState.errors.department.message}
              </p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="priority">Priority</Label>
            <select
              id="priority"
              className="border-input bg-background flex h-9 w-full rounded-md border px-3 text-sm"
              {...form.register("priority")}
            >
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
              <option value="CRITICAL">Critical</option>
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="estimatedBudget">Estimated budget</Label>
            <Input
              id="estimatedBudget"
              type="number"
              min={0.01}
              step={0.01}
              {...form.register("estimatedBudget", { valueAsNumber: true })}
            />
            {form.formState.errors.estimatedBudget ? (
              <p className="text-destructive text-sm">
                {form.formState.errors.estimatedBudget.message}
              </p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="currency">Currency</Label>
            <Input id="currency" maxLength={3} {...form.register("currency")} />
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="requiredDeliveryDate">Required delivery date</Label>
            <Input
              id="requiredDeliveryDate"
              type="date"
              {...form.register("requiredDeliveryDate")}
            />
            {form.formState.errors.requiredDeliveryDate ? (
              <p className="text-destructive text-sm">
                {form.formState.errors.requiredDeliveryDate.message}
              </p>
            ) : null}
          </div>

          <div className="flex gap-2 md:col-span-2">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : submitLabel}
            </Button>
            {onCancel ? (
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
            ) : null}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
