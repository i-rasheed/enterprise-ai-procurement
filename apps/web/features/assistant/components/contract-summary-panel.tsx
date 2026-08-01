"use client";

import { useState } from "react";
import { FileText, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { useContracts } from "@/features/contracts/hooks/use-contracts";
import type { ContractSummary } from "@/features/assistant/types";

import { useContractSummary } from "../hooks/use-assistant";
import { streamText } from "../utils/stream-text";

export function ContractSummaryPanel() {
  const contractsQuery = useContracts({ page: 1, limit: 100 });
  const summaryMutation = useContractSummary();
  const [contractId, setContractId] = useState("");
  const [summary, setSummary] = useState<ContractSummary | null>(null);
  const [streamingSummary, setStreamingSummary] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);

  const handleSummarize = async () => {
    if (!contractId) return;

    setSummary(null);
    setStreamingSummary("");
    setIsStreaming(true);

    try {
      const result = await summaryMutation.mutateAsync(contractId);
      await streamText(result.executiveSummary, (partial) => {
        setStreamingSummary(partial);
      });
      setSummary(result);
      setStreamingSummary("");
    } finally {
      setIsStreaming(false);
    }
  };

  const contracts = contractsQuery.data?.contracts ?? [];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="size-5" />
          Contract summary
        </CardTitle>
        <CardDescription>
          Generate an AI executive summary with key dates, obligations, risks,
          and renewal information.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_auto]">
          <div className="space-y-2">
            <Label htmlFor="contractSelect">Contract</Label>
            {contractsQuery.isLoading ? (
              <Skeleton className="h-9 w-full" />
            ) : (
              <select
                id="contractSelect"
                className="border-input bg-background flex h-9 w-full rounded-md border px-3 text-sm"
                value={contractId}
                onChange={(event) => setContractId(event.target.value)}
              >
                <option value="">Select a contract</option>
                {contracts.map((contract) => (
                  <option key={contract.id} value={contract.id}>
                    {contract.contractNumber} — {contract.title}
                  </option>
                ))}
              </select>
            )}
          </div>
          <div className="flex items-end">
            <Button
              type="button"
              onClick={() => void handleSummarize()}
              disabled={
                !contractId || summaryMutation.isPending || isStreaming
              }
            >
              {summaryMutation.isPending || isStreaming ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <FileText className="size-4" />
              )}
              Summarize
            </Button>
          </div>
        </div>

        {streamingSummary ? (
          <div className="rounded-lg border bg-muted/30 p-4">
            <p className="mb-2 text-sm font-medium">Executive summary</p>
            <p className="text-muted-foreground text-sm leading-relaxed whitespace-pre-wrap">
              {streamingSummary}
              <span className="ml-1 inline-block h-4 w-1 animate-pulse bg-current align-middle" />
            </p>
          </div>
        ) : null}

        {summary ? (
          <div className="space-y-6">
            <section className="rounded-lg border bg-muted/30 p-4">
              <h4 className="mb-2 text-sm font-semibold">Executive summary</h4>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {summary.executiveSummary}
              </p>
            </section>

            {summary.importantDates.length > 0 ? (
              <section className="space-y-2">
                <h4 className="text-sm font-semibold">Important dates</h4>
                <div className="grid gap-3 md:grid-cols-2">
                  {summary.importantDates.map((item) => (
                    <div key={`${item.label}-${item.date}`} className="rounded-lg border p-3">
                      <p className="font-medium">{item.label}</p>
                      <p className="text-muted-foreground text-sm">{item.date}</p>
                      {item.description ? (
                        <p className="text-muted-foreground mt-1 text-xs">
                          {item.description}
                        </p>
                      ) : null}
                    </div>
                  ))}
                </div>
              </section>
            ) : null}

            {summary.obligations.length > 0 ? (
              <section className="space-y-2">
                <h4 className="text-sm font-semibold">Obligations</h4>
                <ul className="text-muted-foreground list-disc space-y-1 pl-5 text-sm">
                  {summary.obligations.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </section>
            ) : null}

            {summary.risks.length > 0 ? (
              <section className="space-y-2">
                <h4 className="text-sm font-semibold">Risks</h4>
                <div className="space-y-2">
                  {summary.risks.map((risk) => (
                    <div key={risk.risk} className="rounded-lg border p-3 text-sm">
                      <div className="flex items-center justify-between gap-2">
                        <p className="font-medium">{risk.risk}</p>
                        <span className="text-muted-foreground text-xs uppercase">
                          {risk.severity}
                        </span>
                      </div>
                      {risk.mitigation ? (
                        <p className="text-muted-foreground mt-1">
                          Mitigation: {risk.mitigation}
                        </p>
                      ) : null}
                    </div>
                  ))}
                </div>
              </section>
            ) : null}

            {Object.keys(summary.renewalInformation).length > 0 ? (
              <section className="space-y-2">
                <h4 className="text-sm font-semibold">Renewal information</h4>
                <div className="rounded-lg border p-4 text-sm">
                  <dl className="grid gap-2 sm:grid-cols-2">
                    {Object.entries(summary.renewalInformation).map(
                      ([key, value]) => (
                        <div key={key}>
                          <dt className="text-muted-foreground text-xs uppercase">
                            {key.replace(/([A-Z])/g, " $1").trim()}
                          </dt>
                          <dd className="font-medium">{String(value)}</dd>
                        </div>
                      ),
                    )}
                  </dl>
                </div>
              </section>
            ) : null}
          </div>
        ) : (
          <p className="text-muted-foreground text-sm">
            Select a contract and run AI summarization to view key terms and
            risks.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
