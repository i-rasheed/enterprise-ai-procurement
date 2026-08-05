"use client";

import { ShieldAlert } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useVendorRiskAnalysis } from "@/features/vendors/hooks/use-vendors";
import type { VendorRiskAnalysis } from "@/features/vendors/types";
import {
  getRiskScoreColor,
  getRiskScoreLabel,
} from "@/features/vendors/utils/formatters";

type VendorRiskPanelProps = {
  vendorId: string;
  canAnalyze: boolean;
  analysis?: VendorRiskAnalysis | null;
  onAnalysis?: (analysis: VendorRiskAnalysis) => void;
};

function RiskFactorList({
  title,
  data,
}: {
  title: string;
  data: Record<string, unknown>;
}) {
  const factors = Array.isArray(data.factors)
    ? (data.factors as string[])
    : [];
  const score = typeof data.score === "number" ? data.score : null;

  return (
    <div className="rounded-lg border p-4">
      <div className="mb-2 flex items-center justify-between">
        <p className="font-medium">{title}</p>
        {score != null ? (
          <span className="text-muted-foreground text-sm">{score}/100</span>
        ) : null}
      </div>
      {factors.length > 0 ? (
        <ul className="text-muted-foreground list-disc space-y-1 pl-4 text-sm">
          {factors.map((factor) => (
            <li key={factor}>{factor}</li>
          ))}
        </ul>
      ) : (
        <p className="text-muted-foreground text-sm">No factors reported.</p>
      )}
    </div>
  );
}

export function VendorRiskPanel({
  vendorId,
  canAnalyze,
  analysis,
  onAnalysis,
}: VendorRiskPanelProps) {
  const analyzeRisk = useVendorRiskAnalysis(vendorId);
  const result = analyzeRisk.data ?? analysis;

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between gap-4">
        <div>
          <CardTitle className="flex items-center gap-2">
            <ShieldAlert className="size-5" />
            Risk score
          </CardTitle>
          <CardDescription>
            AI-powered vendor risk analysis across financial, delivery,
            compliance, and operational factors.
          </CardDescription>
        </div>
        {canAnalyze ? (
          <Button
            type="button"
            variant="outline"
            disabled={analyzeRisk.isPending}
            onClick={() =>
              analyzeRisk.mutate(undefined, {
                onSuccess: (data) => onAnalysis?.(data),
              })
            }
          >
            {analyzeRisk.isPending ? "Analyzing..." : "Run analysis"}
          </Button>
        ) : null}
      </CardHeader>
      <CardContent className="space-y-4">
        {result ? (
          <>
            <div className="space-y-2">
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-3xl font-bold">{result.riskScore}</p>
                  <p
                    className={`text-sm font-medium ${getRiskScoreColor(result.riskScore)}`}
                  >
                    {getRiskScoreLabel(result.riskScore)} risk
                  </p>
                </div>
              </div>
              <Progress value={result.riskScore} className="h-2" />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <RiskFactorList title="Financial" data={result.financialRisk} />
              <RiskFactorList title="Delivery" data={result.deliveryRisk} />
              <RiskFactorList title="Compliance" data={result.complianceRisk} />
              <RiskFactorList title="Operational" data={result.operationalRisk} />
            </div>

            <div className="rounded-lg bg-muted/50 p-4">
              <p className="mb-1 text-sm font-medium">Recommendation</p>
              <p className="text-muted-foreground text-sm">
                {result.overallRecommendation}
              </p>
            </div>
          </>
        ) : (
          <p className="text-muted-foreground py-8 text-center text-sm">
            {canAnalyze
              ? "Run AI analysis to generate a vendor risk score."
              : "Risk analysis is available to admins, procurement managers, and finance users."}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
