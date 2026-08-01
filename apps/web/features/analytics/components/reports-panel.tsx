"use client";

import { useState } from "react";
import { FileBarChart, Loader2 } from "lucide-react";

import { EmptyState } from "@/components/shared/empty-state";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import type { AnalyticsFilters } from "@/features/analytics/types";
import { ApiClientError } from "@/lib/api";

import { useReport, useReportsList } from "../hooks/use-analytics";
import { kpiEntries, summaryEntries } from "../utils/format-summary";
import { AnalyticsChartsCompact } from "./analytics-charts-section";
import { ExportActions } from "./export-actions";

type ReportsPanelProps = {
  filters: AnalyticsFilters;
};

export function ReportsPanel({ filters }: ReportsPanelProps) {
  const reportsQuery = useReportsList();
  const [selectedReportId, setSelectedReportId] = useState("executive-summary");
  const reportQuery = useReport(selectedReportId, filters, Boolean(selectedReportId));

  const reports = reportsQuery.data ?? [];
  const report = reportQuery.data;

  if (reportsQuery.isError) {
    return (
      <EmptyState
        title="Unable to load reports"
        description={
          reportsQuery.error instanceof ApiClientError
            ? reportsQuery.error.message
            : "Something went wrong."
        }
        action={{ label: "Retry", onClick: () => reportsQuery.refetch() }}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Reports</h2>
        <p className="text-muted-foreground text-sm">
          Generate procurement reports and export to PDF, Excel, or CSV.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileBarChart className="size-5" />
            Report library
          </CardTitle>
          <CardDescription>
            Select a report type, preview the generated data, then export.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="reportSelect">Report type</Label>
            {reportsQuery.isLoading ? (
              <Skeleton className="h-9 w-full" />
            ) : (
              <select
                id="reportSelect"
                className="border-input bg-background flex h-9 w-full rounded-md border px-3 text-sm"
                value={selectedReportId}
                onChange={(event) => setSelectedReportId(event.target.value)}
              >
                {reports.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.title}
                  </option>
                ))}
              </select>
            )}
          </div>

          <ExportActions
            reportId={selectedReportId}
            filters={filters}
            disabled={!selectedReportId || reportQuery.isLoading}
          />
        </CardContent>
      </Card>

      {reportQuery.isLoading ? (
        <Card>
          <CardContent className="flex items-center gap-2 py-10 text-sm">
            <Loader2 className="size-4 animate-spin" />
            Generating report preview...
          </CardContent>
        </Card>
      ) : reportQuery.isError ? (
        <EmptyState
          title="Unable to generate report"
          description={
            reportQuery.error instanceof ApiClientError
              ? reportQuery.error.message
              : "Something went wrong."
          }
          action={{ label: "Retry", onClick: () => reportQuery.refetch() }}
        />
      ) : report ? (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{report.title}</CardTitle>
              <CardDescription>
                Generated {new Date(report.generatedAt).toLocaleString()}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <dl className="grid gap-3 md:grid-cols-2">
                {summaryEntries(report.data).map((item) => (
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
            </CardContent>
          </Card>

          {Object.keys(report.kpis).length > 0 ? (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Report KPIs</CardTitle>
              </CardHeader>
              <CardContent>
                <dl className="grid gap-3 md:grid-cols-2">
                  {kpiEntries(report.kpis).map((item) => (
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
              </CardContent>
            </Card>
          ) : null}

          <AnalyticsChartsCompact charts={report.charts} />
        </div>
      ) : null}
    </div>
  );
}
