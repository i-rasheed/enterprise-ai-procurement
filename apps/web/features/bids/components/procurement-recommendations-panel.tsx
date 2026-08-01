"use client";

import { Sparkles } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useProcurementRecommendations } from "@/features/bids/hooks/use-bids";
import type { ProcurementRecommendations } from "@/features/bids/types";

type ProcurementRecommendationsPanelProps = {
  procurementRequestId: string;
  canRequest: boolean;
};

export function ProcurementRecommendationsPanel({
  procurementRequestId,
  canRequest,
}: ProcurementRecommendationsPanelProps) {
  const [recommendations, setRecommendations] =
    useState<ProcurementRecommendations | null>(null);
  const fetchRecommendations = useProcurementRecommendations(procurementRequestId);

  const handleGenerate = async () => {
    const result = await fetchRecommendations.mutateAsync();
    setRecommendations(result);
  };

  if (!canRequest) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>AI recommendations</CardTitle>
          <CardDescription>
            Recommendations are available to procurement, finance, and admin
            roles.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>AI recommendations</CardTitle>
        <CardDescription>
          Generate vendor and strategy recommendations based on bid evaluation
          data.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button
          type="button"
          variant="outline"
          onClick={handleGenerate}
          disabled={fetchRecommendations.isPending}
        >
          <Sparkles className="size-4" />
          {fetchRecommendations.isPending
            ? "Generating..."
            : "Generate recommendations"}
        </Button>

        {recommendations ? (
          <div className="space-y-6">
            {recommendations.preferredVendors.length > 0 ? (
              <section className="space-y-2">
                <h4 className="text-sm font-semibold">Preferred vendors</h4>
                <ul className="space-y-2">
                  {recommendations.preferredVendors.map((vendor, index) => (
                    <li
                      key={`${vendor.vendorName}-${index}`}
                      className="bg-muted rounded-lg p-3 text-sm"
                    >
                      <p className="font-medium">{vendor.vendorName}</p>
                      <p className="text-muted-foreground">{vendor.reason}</p>
                      {vendor.estimatedSavings != null ? (
                        <p className="text-muted-foreground mt-1 text-xs">
                          Est. savings:{" "}
                          {new Intl.NumberFormat(undefined, {
                            style: "currency",
                            currency: "USD",
                          }).format(vendor.estimatedSavings)}
                        </p>
                      ) : null}
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}

            {recommendations.savingsOpportunities.length > 0 ? (
              <section className="space-y-2">
                <h4 className="text-sm font-semibold">Savings opportunities</h4>
                <ul className="text-muted-foreground list-disc space-y-1 pl-5 text-sm">
                  {recommendations.savingsOpportunities.map((item, index) => (
                    <li key={`${item}-${index}`}>{item}</li>
                  ))}
                </ul>
              </section>
            ) : null}

            {recommendations.alternativeSuppliers.length > 0 ? (
              <section className="space-y-2">
                <h4 className="text-sm font-semibold">Alternative suppliers</h4>
                <ul className="space-y-2">
                  {recommendations.alternativeSuppliers.map((supplier, index) => (
                    <li
                      key={`${supplier.name}-${index}`}
                      className="bg-muted rounded-lg p-3 text-sm"
                    >
                      <p className="font-medium">{supplier.name}</p>
                      <p className="text-muted-foreground text-xs">
                        {supplier.category}
                      </p>
                      <p className="text-muted-foreground mt-1">
                        {supplier.rationale}
                      </p>
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}

            {recommendations.procurementStrategy ? (
              <section className="space-y-2">
                <h4 className="text-sm font-semibold">Procurement strategy</h4>
                <p className="text-muted-foreground text-sm">
                  {recommendations.procurementStrategy}
                </p>
              </section>
            ) : null}
          </div>
        ) : (
          <p className="text-muted-foreground text-sm">
            No recommendations generated yet.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
