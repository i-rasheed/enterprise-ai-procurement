"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { AnalyticsSummary } from "@/features/analytics/types";

import { kpiEntries, summaryEntries } from "../utils/format-summary";
import { AnalyticsChartsSection } from "./analytics-charts-section";

type DomainAnalyticsViewProps = {
  title: string;
  description: string;
  data?: AnalyticsSummary;
  isLoading?: boolean;
  isError?: boolean;
  errorMessage?: string;
  onRetry?: () => void;
};

export function DomainAnalyticsView({
  title,
  description,
  data,
  isLoading,
  isError,
  errorMessage,
  onRetry,
}: DomainAnalyticsViewProps) {
  if (isError) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">
            {errorMessage ?? "Unable to load analytics."}
          </p>
          {onRetry ? (
            <button
              type="button"
              className="text-primary mt-3 text-sm font-medium hover:underline"
              onClick={onRetry}
            >
              Retry
            </button>
          ) : null}
        </CardContent>
      </Card>
    );
  }

  const summary = data ? summaryEntries(data.summary) : [];
  const kpis = data ? kpiEntries(data.kpis) : [];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">{title}</h2>
        <p className="text-muted-foreground text-sm">{description}</p>
      </div>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {isLoading
          ? Array.from({ length: 4 }).map((_, index) => (
              <Card key={index}>
                <CardHeader className="pb-2">
                  <Skeleton className="h-4 w-24" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-8 w-20" />
                </CardContent>
              </Card>
            ))
          : summary.map((item) => (
              <Card key={item.key}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">
                    {item.label}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">{item.value}</p>
                </CardContent>
              </Card>
            ))}
      </section>

      {kpis.length > 0 || isLoading ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">KPIs</CardTitle>
            <CardDescription>Key performance indicators</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="grid gap-3 md:grid-cols-2">
                {Array.from({ length: 4 }).map((_, index) => (
                  <Skeleton key={index} className="h-12 w-full" />
                ))}
              </div>
            ) : (
              <dl className="grid gap-3 md:grid-cols-2">
                {kpis.map((item) => (
                  <div
                    key={item.key}
                    className="flex items-center justify-between rounded-lg border px-3 py-2"
                  >
                    <dt className="text-muted-foreground text-sm">
                      {item.label}
                    </dt>
                    <dd className="font-medium">{item.value}</dd>
                  </div>
                ))}
              </dl>
            )}
          </CardContent>
        </Card>
      ) : null}

      <AnalyticsChartsSection
        charts={data?.charts ?? []}
        isLoading={isLoading}
      />
    </div>
  );
}
