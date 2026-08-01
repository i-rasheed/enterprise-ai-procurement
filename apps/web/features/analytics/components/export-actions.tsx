"use client";

import { Download, FileSpreadsheet, FileText } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { AnalyticsFilters, ExportFormat } from "@/features/analytics/types";

import { useExportReport } from "../hooks/use-analytics";

type ExportActionsProps = {
  reportId: string;
  filters?: AnalyticsFilters;
  disabled?: boolean;
};

const EXPORT_OPTIONS: Array<{
  format: ExportFormat;
  label: string;
  icon: typeof FileText;
}> = [
  { format: "pdf", label: "PDF", icon: FileText },
  { format: "excel", label: "Excel", icon: FileSpreadsheet },
  { format: "csv", label: "CSV", icon: Download },
];

export function ExportActions({
  reportId,
  filters,
  disabled,
}: ExportActionsProps) {
  const exportReport = useExportReport();

  return (
    <div className="flex flex-wrap gap-2">
      {EXPORT_OPTIONS.map((option) => {
        const Icon = option.icon;
        return (
          <Button
            key={option.format}
            type="button"
            variant="outline"
            size="sm"
            disabled={disabled || exportReport.isPending}
            onClick={() =>
              exportReport.mutate({
                reportId,
                format: option.format,
                filters,
              })
            }
          >
            <Icon className="size-4" />
            Export {option.label}
          </Button>
        );
      })}
    </div>
  );
}
