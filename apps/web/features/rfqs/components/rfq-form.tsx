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
  rfqFormSchema,
  type RfqFormValues,
} from "@/features/rfqs/schemas/rfq.schema";
import type { RFQ } from "@/features/rfqs/types";
import type { ProcurementRequest } from "@/features/procurement/types";

type RfqFormProps = {
  rfq?: RFQ;
  approvedRequests: ProcurementRequest[];
  submitLabel: string;
  isSubmitting?: boolean;
  onSubmit: (values: RfqFormValues) => void;
  onCancel?: () => void;
  lockProcurementRequest?: boolean;
};

function toFormValues(
  rfq?: RFQ,
  approvedRequests: ProcurementRequest[] = [],
): RfqFormValues {
  if (!rfq) {
    return {
      procurementRequestId: approvedRequests[0]?.id ?? "",
      title: "",
      description: "",
      closingDate: "",
    };
  }

  return {
    procurementRequestId: rfq.procurementRequestId,
    title: rfq.title,
    description: rfq.description,
    closingDate: rfq.closingDate.slice(0, 10),
  };
}

export function RfqForm({
  rfq,
  approvedRequests,
  submitLabel,
  isSubmitting,
  onSubmit,
  onCancel,
  lockProcurementRequest,
}: RfqFormProps) {
  const form = useForm<RfqFormValues>({
    resolver: zodResolver(rfqFormSchema),
    values: toFormValues(rfq, approvedRequests),
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>{rfq ? "Edit RFQ" : "Create RFQ"}</CardTitle>
        <CardDescription>
          {rfq
            ? "Update RFQ details and closing date."
            : "Create a draft RFQ linked to an approved procurement request."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form
          className="grid gap-4"
          onSubmit={form.handleSubmit(onSubmit)}
        >
          <div className="space-y-2">
            <Label htmlFor="procurementRequestId">Procurement request</Label>
            <select
              id="procurementRequestId"
              className="border-input bg-background flex h-9 w-full rounded-md border px-3 text-sm"
              disabled={lockProcurementRequest || Boolean(rfq)}
              {...form.register("procurementRequestId")}
            >
              <option value="">Select approved request</option>
              {approvedRequests.map((request) => (
                <option key={request.id} value={request.id}>
                  {request.title} ({request.department})
                </option>
              ))}
            </select>
            {form.formState.errors.procurementRequestId ? (
              <p className="text-destructive text-sm">
                {form.formState.errors.procurementRequestId.message}
              </p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input id="title" {...form.register("title")} />
            {form.formState.errors.title ? (
              <p className="text-destructive text-sm">
                {form.formState.errors.title.message}
              </p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <textarea
              id="description"
              rows={4}
              className="border-input bg-background flex w-full rounded-md border px-3 py-2 text-sm"
              {...form.register("description")}
            />
            {form.formState.errors.description ? (
              <p className="text-destructive text-sm">
                {form.formState.errors.description.message}
              </p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="closingDate">Closing date</Label>
            <Input id="closingDate" type="date" {...form.register("closingDate")} />
            {form.formState.errors.closingDate ? (
              <p className="text-destructive text-sm">
                {form.formState.errors.closingDate.message}
              </p>
            ) : null}
          </div>

          <div className="flex gap-2">
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
