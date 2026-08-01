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
  renewContractSchema,
  terminateContractSchema,
  type RenewContractFormValues,
  type TerminateContractFormValues,
} from "@/features/contracts/schemas/contract.schema";
import {
  canActivateContract,
  canExpireContract,
  canRenewContract,
  canTerminateContract,
} from "@/features/contracts/config/permissions";
import {
  useActivateContract,
  useExpireContract,
  useRenewContract,
  useTerminateContract,
} from "@/features/contracts/hooks/use-contracts";
import type { Contract } from "@/features/contracts/types";

type ContractActionsPanelProps = {
  contract: Contract;
  canManage: boolean;
};

export function ContractActionsPanel({
  contract,
  canManage,
}: ContractActionsPanelProps) {
  const activateContract = useActivateContract(contract.id);
  const renewContract = useRenewContract(contract.id);
  const terminateContract = useTerminateContract(contract.id);
  const expireContract = useExpireContract(contract.id);

  const renewForm = useForm<RenewContractFormValues>({
    resolver: zodResolver(renewContractSchema),
    defaultValues: {
      startDate: contract.endDate.slice(0, 10),
      endDate: "",
      value: contract.value,
      renewalDate: contract.renewalDate?.slice(0, 10) ?? "",
      changeSummary: "",
    },
  });

  const terminateForm = useForm<TerminateContractFormValues>({
    resolver: zodResolver(terminateContractSchema),
    defaultValues: { reason: "" },
  });

  const showActivate = canManage && canActivateContract(contract);
  const showRenew = canManage && canRenewContract(contract);
  const showExpire = canManage && canExpireContract(contract);
  const showTerminate = canManage && canTerminateContract(contract);

  const handleActivate = () => {
    if (
      window.confirm(
        `Activate ${contract.contractNumber}? This makes the contract live.`,
      )
    ) {
      activateContract.mutate();
    }
  };

  const handleExpire = () => {
    if (
      window.confirm(
        `Mark ${contract.contractNumber} as expired?`,
      )
    ) {
      expireContract.mutate();
    }
  };

  const handleRenew = renewForm.handleSubmit((values) => {
    renewContract.mutate(values);
  });

  const handleTerminate = terminateForm.handleSubmit((values) => {
    if (
      window.confirm(
        `Terminate ${contract.contractNumber}? This action cannot be undone.`,
      )
    ) {
      terminateContract.mutate(values);
    }
  });

  if (!showActivate && !showRenew && !showExpire && !showTerminate) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Actions</CardTitle>
          <CardDescription>
            No lifecycle actions available for this contract status.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {showActivate ? (
        <Card>
          <CardHeader>
            <CardTitle>Activate contract</CardTitle>
            <CardDescription>
              Make this draft contract active and enforceable.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              type="button"
              onClick={handleActivate}
              disabled={activateContract.isPending}
            >
              {activateContract.isPending ? "Activating..." : "Activate contract"}
            </Button>
          </CardContent>
        </Card>
      ) : null}

      {showRenew ? (
        <Card>
          <CardHeader>
            <CardTitle>Renew contract</CardTitle>
            <CardDescription>
              Extend the contract term and record a renewal summary in version
              history.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleRenew} className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="renewStartDate">New start date</Label>
                  <Input
                    id="renewStartDate"
                    type="date"
                    disabled={renewContract.isPending}
                    {...renewForm.register("startDate")}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="renewEndDate">New end date</Label>
                  <Input
                    id="renewEndDate"
                    type="date"
                    disabled={renewContract.isPending}
                    {...renewForm.register("endDate")}
                  />
                </div>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="renewValue">Contract value</Label>
                  <Input
                    id="renewValue"
                    type="number"
                    step="0.01"
                    min={0.01}
                    disabled={renewContract.isPending}
                    {...renewForm.register("value", { valueAsNumber: true })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="renewalDate">Next renewal date</Label>
                  <Input
                    id="renewalDate"
                    type="date"
                    disabled={renewContract.isPending}
                    {...renewForm.register("renewalDate")}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="changeSummary">Change summary</Label>
                <textarea
                  id="changeSummary"
                  rows={3}
                  className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex min-h-[80px] w-full rounded-md border px-3 py-2 text-sm shadow-xs focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                  placeholder="Describe the renewal terms..."
                  disabled={renewContract.isPending}
                  {...renewForm.register("changeSummary")}
                />
                {renewForm.formState.errors.changeSummary ? (
                  <p className="text-destructive text-sm">
                    {renewForm.formState.errors.changeSummary.message}
                  </p>
                ) : null}
              </div>
              <Button type="submit" disabled={renewContract.isPending}>
                {renewContract.isPending ? "Renewing..." : "Renew contract"}
              </Button>
            </form>
          </CardContent>
        </Card>
      ) : null}

      {showExpire ? (
        <Card>
          <CardHeader>
            <CardTitle>Expire contract</CardTitle>
            <CardDescription>
              Mark this active contract as expired when the term has ended.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              type="button"
              variant="outline"
              onClick={handleExpire}
              disabled={expireContract.isPending}
            >
              {expireContract.isPending ? "Expiring..." : "Mark as expired"}
            </Button>
          </CardContent>
        </Card>
      ) : null}

      {showTerminate ? (
        <Card>
          <CardHeader>
            <CardTitle>Terminate contract</CardTitle>
            <CardDescription>
              End the contract early with a documented reason.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleTerminate} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="terminateReason">Termination reason</Label>
                <textarea
                  id="terminateReason"
                  rows={3}
                  className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex min-h-[80px] w-full rounded-md border px-3 py-2 text-sm shadow-xs focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                  placeholder="Explain why the contract is being terminated..."
                  disabled={terminateContract.isPending}
                  {...terminateForm.register("reason")}
                />
                {terminateForm.formState.errors.reason ? (
                  <p className="text-destructive text-sm">
                    {terminateForm.formState.errors.reason.message}
                  </p>
                ) : null}
              </div>
              <Button
                type="submit"
                variant="destructive"
                disabled={terminateContract.isPending}
              >
                {terminateContract.isPending
                  ? "Terminating..."
                  : "Terminate contract"}
              </Button>
            </form>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
