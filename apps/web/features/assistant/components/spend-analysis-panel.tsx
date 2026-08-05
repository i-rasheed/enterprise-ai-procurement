"use client";

import { useState } from "react";
import { BarChart3, Loader2 } from "lucide-react";

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

import { useSpendAnalysis } from "../hooks/use-assistant";
import type { SpendAnalysis } from "../types";
import { streamText } from "../utils/stream-text";

function formatCurrency(value: number): string {
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

export function SpendAnalysisPanel() {
  const spendMutation = useSpendAnalysis();
  const [department, setDepartment] = useState("");
  const [analysis, setAnalysis] = useState<SpendAnalysis | null>(null);
  const [streamingInsight, setStreamingInsight] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);

  const handleAnalyze = async () => {
    setAnalysis(null);
    setStreamingInsight("");
    setIsStreaming(true);

    try {
      const result = await spendMutation.mutateAsync({
        department: department.trim() || undefined,
      });

      const insight = [
        result.topCategories.length
          ? `Top category: ${result.topCategories[0]?.category} at ${result.topCategories[0]?.percentage}% of spend.`
          : "",
        result.costReductionOpportunities[0]
          ? `Primary opportunity: ${result.costReductionOpportunities[0].opportunity}.`
          : "",
      ]
        .filter(Boolean)
        .join(" ");

      if (insight) {
        await streamText(insight, (partial) => setStreamingInsight(partial));
      }

      setAnalysis(result);
      setStreamingInsight("");
    } finally {
      setIsStreaming(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="size-5" />
          Spend analysis
        </CardTitle>
        <CardDescription>
          AI-powered spend breakdown with overspending alerts, vendor
          concentration, and cost reduction opportunities.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_auto]">
          <div className="space-y-2">
            <Label htmlFor="departmentFilter">Department (optional)</Label>
            <Input
              id="departmentFilter"
              placeholder="e.g. IT"
              value={department}
              onChange={(event) => setDepartment(event.target.value)}
            />
          </div>
          <div className="flex items-end">
            <Button
              type="button"
              onClick={() => void handleAnalyze()}
              disabled={spendMutation.isPending || isStreaming}
            >
              {spendMutation.isPending || isStreaming ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <BarChart3 className="size-4" />
              )}
              Analyze spend
            </Button>
          </div>
        </div>

        {streamingInsight ? (
          <div className="rounded-lg border bg-muted/30 p-4">
            <p className="text-muted-foreground text-sm leading-relaxed">
              {streamingInsight}
              <span className="ml-1 inline-block h-4 w-1 animate-pulse bg-current align-middle" />
            </p>
          </div>
        ) : null}

        {analysis ? (
          <div className="space-y-6">
            {analysis.topCategories.length > 0 ? (
              <section className="space-y-2">
                <h4 className="text-sm font-semibold">Top categories</h4>
                <div className="grid gap-3 md:grid-cols-2">
                  {analysis.topCategories.map((item) => (
                    <div key={item.category} className="rounded-lg border p-3">
                      <p className="font-medium">{item.category}</p>
                      <p className="text-muted-foreground text-sm">
                        {formatCurrency(item.totalSpend)} · {item.percentage}%
                      </p>
                    </div>
                  ))}
                </div>
              </section>
            ) : null}

            {analysis.overspending.length > 0 ? (
              <section className="space-y-2">
                <h4 className="text-sm font-semibold">Overspending areas</h4>
                <div className="space-y-2">
                  {analysis.overspending.map((item) => (
                    <div key={item.area} className="rounded-lg border p-3 text-sm">
                      <div className="flex items-center justify-between gap-2">
                        <p className="font-medium">{item.area}</p>
                        <span>{formatCurrency(item.amount)}</span>
                      </div>
                      <p className="text-muted-foreground mt-1">
                        {item.recommendation}
                      </p>
                    </div>
                  ))}
                </div>
              </section>
            ) : null}

            {analysis.vendorConcentration.length > 0 ? (
              <section className="space-y-2">
                <h4 className="text-sm font-semibold">Vendor concentration</h4>
                <div className="space-y-2">
                  {analysis.vendorConcentration.map((item) => (
                    <div key={item.vendor} className="rounded-lg border p-3 text-sm">
                      <div className="flex items-center justify-between gap-2">
                        <p className="font-medium">{item.vendor}</p>
                        <span>{item.spendShare}% share</span>
                      </div>
                      <p className="text-muted-foreground mt-1">{item.risk}</p>
                    </div>
                  ))}
                </div>
              </section>
            ) : null}

            {analysis.costReductionOpportunities.length > 0 ? (
              <section className="space-y-2">
                <h4 className="text-sm font-semibold">
                  Cost reduction opportunities
                </h4>
                <div className="space-y-2">
                  {analysis.costReductionOpportunities.map((item) => (
                    <div
                      key={item.opportunity}
                      className="rounded-lg border p-3 text-sm"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <p className="font-medium">{item.opportunity}</p>
                        <span>{formatCurrency(item.estimatedSaving)}</span>
                      </div>
                      <p className="text-muted-foreground mt-1">
                        Effort: {item.effort}
                      </p>
                    </div>
                  ))}
                </div>
              </section>
            ) : null}
          </div>
        ) : (
          <p className="text-muted-foreground text-sm">
            Run spend analysis to identify category trends and savings
            opportunities.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
