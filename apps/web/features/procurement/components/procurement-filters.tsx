"use client";

import { Search, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { ProcurementFilters } from "@/features/procurement/types";

type ProcurementFiltersPanelProps = {
  filters: ProcurementFilters;
  onChange: (filters: ProcurementFilters) => void;
  onReset: () => void;
};

export function ProcurementFiltersPanel({
  filters,
  onChange,
  onReset,
}: ProcurementFiltersPanelProps) {
  const hasActiveFilters = Boolean(
    filters.search || filters.status || filters.priority || filters.department,
  );

  return (
    <div className="grid gap-4 rounded-xl border p-4 md:grid-cols-2 xl:grid-cols-5">
      <div className="space-y-2 xl:col-span-2">
        <Label htmlFor="procurementSearch">Search</Label>
        <div className="relative">
          <Search className="text-muted-foreground absolute top-2.5 left-3 size-4" />
          <Input
            id="procurementSearch"
            placeholder="Search title, description, department..."
            className="pl-9"
            value={filters.search ?? ""}
            onChange={(event) =>
              onChange({ ...filters, search: event.target.value, page: 1 })
            }
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="procurementStatus">Status</Label>
        <select
          id="procurementStatus"
          className="border-input bg-background flex h-9 w-full rounded-md border px-3 text-sm"
          value={filters.status ?? ""}
          onChange={(event) =>
            onChange({
              ...filters,
              status: event.target.value
                ? (event.target.value as ProcurementFilters["status"])
                : undefined,
              page: 1,
            })
          }
        >
          <option value="">All statuses</option>
          <option value="DRAFT">Draft</option>
          <option value="SUBMITTED">Submitted</option>
          <option value="APPROVED">Approved</option>
          <option value="REJECTED">Rejected</option>
          <option value="CANCELLED">Cancelled</option>
        </select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="procurementPriority">Priority</Label>
        <select
          id="procurementPriority"
          className="border-input bg-background flex h-9 w-full rounded-md border px-3 text-sm"
          value={filters.priority ?? ""}
          onChange={(event) =>
            onChange({
              ...filters,
              priority: event.target.value
                ? (event.target.value as ProcurementFilters["priority"])
                : undefined,
              page: 1,
            })
          }
        >
          <option value="">All priorities</option>
          <option value="LOW">Low</option>
          <option value="MEDIUM">Medium</option>
          <option value="HIGH">High</option>
          <option value="CRITICAL">Critical</option>
        </select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="procurementDepartment">Department</Label>
        <Input
          id="procurementDepartment"
          placeholder="e.g. Operations"
          value={filters.department ?? ""}
          onChange={(event) =>
            onChange({
              ...filters,
              department: event.target.value || undefined,
              page: 1,
            })
          }
        />
      </div>

      {hasActiveFilters ? (
        <div className="flex items-end xl:col-span-5">
          <Button type="button" variant="ghost" size="sm" onClick={onReset}>
            <X className="mr-2 size-4" />
            Clear filters
          </Button>
        </div>
      ) : null}
    </div>
  );
}
