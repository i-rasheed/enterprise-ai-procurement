"use client";

import { Search, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { RFQFilters } from "@/features/rfqs/types";

type RfqFiltersPanelProps = {
  filters: RFQFilters;
  onChange: (filters: RFQFilters) => void;
  onReset: () => void;
};

export function RfqFiltersPanel({
  filters,
  onChange,
  onReset,
}: RfqFiltersPanelProps) {
  const hasActiveFilters = Boolean(filters.search || filters.status);

  return (
    <div className="grid gap-4 rounded-xl border p-4 md:grid-cols-3">
      <div className="space-y-2 md:col-span-2">
        <Label htmlFor="rfqSearch">Search</Label>
        <div className="relative">
          <Search className="text-muted-foreground absolute top-2.5 left-3 size-4" />
          <Input
            id="rfqSearch"
            placeholder="Search by title, RFQ number, description..."
            className="pl-9"
            value={filters.search ?? ""}
            onChange={(event) =>
              onChange({ ...filters, search: event.target.value, page: 1 })
            }
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="rfqStatus">Status</Label>
        <select
          id="rfqStatus"
          className="border-input bg-background flex h-9 w-full rounded-md border px-3 text-sm"
          value={filters.status ?? ""}
          onChange={(event) =>
            onChange({
              ...filters,
              status: event.target.value
                ? (event.target.value as RFQFilters["status"])
                : undefined,
              page: 1,
            })
          }
        >
          <option value="">All statuses</option>
          <option value="DRAFT">Draft</option>
          <option value="PUBLISHED">Published</option>
          <option value="CLOSED">Closed</option>
          <option value="CANCELLED">Cancelled</option>
        </select>
      </div>

      {hasActiveFilters ? (
        <div className="flex items-end md:col-span-3">
          <Button type="button" variant="ghost" size="sm" onClick={onReset}>
            <X className="mr-2 size-4" />
            Clear filters
          </Button>
        </div>
      ) : null}
    </div>
  );
}
