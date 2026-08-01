"use client";

import { RotateCcw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { AnalyticsFilters } from "@/features/analytics/types";

type AnalyticsFiltersPanelProps = {
  filters: AnalyticsFilters;
  onChange: (filters: AnalyticsFilters) => void;
  onReset: () => void;
  showDepartment?: boolean;
};

export function AnalyticsFiltersPanel({
  filters,
  onChange,
  onReset,
  showDepartment = true,
}: AnalyticsFiltersPanelProps) {
  const hasActiveFilters = Boolean(
    filters.startDate ||
      filters.endDate ||
      filters.department ||
      filters.category ||
      filters.search,
  );

  return (
    <div className="grid gap-4 rounded-xl border p-4 md:grid-cols-2 xl:grid-cols-5">
      <div className="space-y-2">
        <Label htmlFor="analyticsStartDate">Start date</Label>
        <Input
          id="analyticsStartDate"
          type="date"
          value={filters.startDate?.slice(0, 10) ?? ""}
          onChange={(event) =>
            onChange({
              ...filters,
              startDate: event.target.value
                ? new Date(`${event.target.value}T00:00:00.000Z`).toISOString()
                : undefined,
            })
          }
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="analyticsEndDate">End date</Label>
        <Input
          id="analyticsEndDate"
          type="date"
          value={filters.endDate?.slice(0, 10) ?? ""}
          onChange={(event) =>
            onChange({
              ...filters,
              endDate: event.target.value
                ? new Date(`${event.target.value}T23:59:59.999Z`).toISOString()
                : undefined,
            })
          }
        />
      </div>

      {showDepartment ? (
        <div className="space-y-2">
          <Label htmlFor="analyticsDepartment">Department</Label>
          <Input
            id="analyticsDepartment"
            placeholder="e.g. IT"
            value={filters.department ?? ""}
            onChange={(event) =>
              onChange({
                ...filters,
                department: event.target.value || undefined,
              })
            }
          />
        </div>
      ) : null}

      <div className="space-y-2">
        <Label htmlFor="analyticsCategory">Category</Label>
        <Input
          id="analyticsCategory"
          placeholder="e.g. IT Hardware"
          value={filters.category ?? ""}
          onChange={(event) =>
            onChange({
              ...filters,
              category: event.target.value || undefined,
            })
          }
        />
      </div>

      <div className="flex items-end">
        <Button
          type="button"
          variant="outline"
          className="w-full"
          disabled={!hasActiveFilters}
          onClick={onReset}
        >
          <RotateCcw className="size-4" />
          Reset filters
        </Button>
      </div>
    </div>
  );
}
