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
  createContractSchema,
  updateContractSchema,
  type CreateContractFormValues,
  type UpdateContractFormValues,
} from "@/features/contracts/schemas/contract.schema";
import { CONTRACT_TYPES, type Contract } from "@/features/contracts/types";

export type SourceOption = {
  id: string;
  label: string;
};

type ContractCreateFormProps = {
  awards: SourceOption[];
  purchaseOrders: SourceOption[];
  submitLabel: string;
  isSubmitting?: boolean;
  onSubmit: (values: CreateContractFormValues) => void;
  onCancel?: () => void;
};

export function ContractCreateForm({
  awards,
  purchaseOrders,
  submitLabel,
  isSubmitting,
  onSubmit,
  onCancel,
}: ContractCreateFormProps) {
  const form = useForm<CreateContractFormValues>({
    resolver: zodResolver(createContractSchema),
    defaultValues: {
      sourceType: awards.length > 0 ? "award" : "purchaseOrder",
      awardId: awards[0]?.id ?? "",
      purchaseOrderId: purchaseOrders[0]?.id ?? "",
      title: "",
      description: "",
      contractType: "GOODS",
      startDate: "",
      endDate: "",
      value: 0,
      currency: "USD",
      renewalType: "",
      renewalDate: "",
      autoRenew: false,
      signedByOrganisation: "",
      signedByVendor: "",
    },
  });

  const sourceType = form.watch("sourceType");

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create contract</CardTitle>
        <CardDescription>
          Create a draft contract from an award or purchase order.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form className="grid gap-4" onSubmit={form.handleSubmit(onSubmit)}>
          <div className="space-y-2">
            <Label>Source</Label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="radio"
                  value="award"
                  disabled={isSubmitting || awards.length === 0}
                  {...form.register("sourceType")}
                />
                From award
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="radio"
                  value="purchaseOrder"
                  disabled={isSubmitting || purchaseOrders.length === 0}
                  {...form.register("sourceType")}
                />
                From purchase order
              </label>
            </div>
          </div>

          {sourceType === "award" ? (
            <div className="space-y-2">
              <Label htmlFor="awardId">Award</Label>
              <select
                id="awardId"
                className="border-input bg-background flex h-9 w-full rounded-md border px-3 py-1 text-sm"
                disabled={isSubmitting || awards.length === 0}
                {...form.register("awardId")}
              >
                {awards.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.label}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div className="space-y-2">
              <Label htmlFor="purchaseOrderId">Purchase order</Label>
              <select
                id="purchaseOrderId"
                className="border-input bg-background flex h-9 w-full rounded-md border px-3 py-1 text-sm"
                disabled={isSubmitting || purchaseOrders.length === 0}
                {...form.register("purchaseOrderId")}
              >
                {purchaseOrders.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.label}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input id="title" disabled={isSubmitting} {...form.register("title")} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <textarea
              id="description"
              rows={3}
              className="border-input bg-background flex min-h-[80px] w-full rounded-md border px-3 py-2 text-sm"
              disabled={isSubmitting}
              {...form.register("description")}
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="contractType">Type</Label>
              <select
                id="contractType"
                className="border-input bg-background flex h-9 w-full rounded-md border px-3 py-1 text-sm"
                disabled={isSubmitting}
                {...form.register("contractType")}
              >
                {CONTRACT_TYPES.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="value">Value</Label>
              <Input
                id="value"
                type="number"
                step="0.01"
                min={0.01}
                disabled={isSubmitting}
                {...form.register("value", { valueAsNumber: true })}
              />
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="startDate">Start date</Label>
              <Input
                id="startDate"
                type="date"
                disabled={isSubmitting}
                {...form.register("startDate")}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endDate">End date</Label>
              <Input
                id="endDate"
                type="date"
                disabled={isSubmitting}
                {...form.register("endDate")}
              />
            </div>
          </div>

          <div className="flex gap-2">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Creating..." : submitLabel}
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

type ContractEditFormProps = {
  contract: Contract;
  submitLabel: string;
  isSubmitting?: boolean;
  onSubmit: (values: UpdateContractFormValues) => void;
  onCancel?: () => void;
};

export function ContractEditForm({
  contract,
  submitLabel,
  isSubmitting,
  onSubmit,
  onCancel,
}: ContractEditFormProps) {
  const form = useForm<UpdateContractFormValues>({
    resolver: zodResolver(updateContractSchema),
    values: {
      title: contract.title,
      description: contract.description,
      contractType: contract.contractType,
      startDate: contract.startDate.slice(0, 10),
      endDate: contract.endDate.slice(0, 10),
      value: contract.value,
      renewalType: contract.renewalType ?? "",
      renewalDate: contract.renewalDate?.slice(0, 10) ?? "",
      autoRenew: contract.autoRenew,
      signedByOrganisation: contract.signedByOrganisation ?? "",
      signedByVendor: contract.signedByVendor ?? "",
      changeSummary: "",
    },
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Edit contract</CardTitle>
        <CardDescription>Update draft terms for {contract.contractNumber}.</CardDescription>
      </CardHeader>
      <CardContent>
        <form className="grid gap-4" onSubmit={form.handleSubmit(onSubmit)}>
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input id="title" disabled={isSubmitting} {...form.register("title")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <textarea
              id="description"
              rows={3}
              className="border-input bg-background flex min-h-[80px] w-full rounded-md border px-3 py-2 text-sm"
              disabled={isSubmitting}
              {...form.register("description")}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="changeSummary">Change summary</Label>
            <Input
              id="changeSummary"
              placeholder="What changed in this update?"
              disabled={isSubmitting}
              {...form.register("changeSummary")}
            />
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
