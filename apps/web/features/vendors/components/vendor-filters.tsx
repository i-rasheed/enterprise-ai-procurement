"use client";

import { Search, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { VendorFilters } from "@/features/vendors/types";

type VendorFiltersPanelProps = {
  filters: VendorFilters;
  onChange: (filters: VendorFilters) => void;
  onReset: () => void;
};

export function VendorFiltersPanel({
  filters,
  onChange,
  onReset,
}: VendorFiltersPanelProps) {
  const hasActiveFilters = Boolean(
    filters.q ||
      filters.status ||
      filters.complianceStatus ||
      filters.category,
  );

  return (
    <div className="grid gap-4 rounded-xl border p-4 md:grid-cols-2 xl:grid-cols-5">
      <div className="space-y-2 xl:col-span-2">
        <Label htmlFor="vendorSearch">Search</Label>
        <div className="relative">
          <Search className="text-muted-foreground absolute top-2.5 left-3 size-4" />
          <Input
            id="vendorSearch"
            placeholder="Search by name, email, category..."
            className="pl-9"
            value={filters.q ?? ""}
            onChange={(event) =>
              onChange({ ...filters, q: event.target.value, page: 1 })
            }
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="vendorStatus">Status</Label>
        <select
          id="vendorStatus"
          className="border-input bg-background flex h-9 w-full rounded-md border px-3 text-sm"
          value={filters.status ?? ""}
          onChange={(event) =>
            onChange({
              ...filters,
              status: event.target.value
                ? (event.target.value as VendorFilters["status"])
                : undefined,
              page: 1,
            })
          }
        >
          <option value="">All statuses</option>
          <option value="ACTIVE">Active</option>
          <option value="INACTIVE">Inactive</option>
          <option value="SUSPENDED">Suspended</option>
          <option value="BLACKLISTED">Blacklisted</option>
        </select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="vendorCompliance">Compliance</Label>
        <select
          id="vendorCompliance"
          className="border-input bg-background flex h-9 w-full rounded-md border px-3 text-sm"
          value={filters.complianceStatus ?? ""}
          onChange={(event) =>
            onChange({
              ...filters,
              complianceStatus: event.target.value
                ? (event.target.value as VendorFilters["complianceStatus"])
                : undefined,
              page: 1,
            })
          }
        >
          <option value="">All compliance</option>
          <option value="PENDING">Pending</option>
          <option value="VERIFIED">Verified</option>
          <option value="REJECTED">Rejected</option>
        </select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="vendorCategory">Category</Label>
        <Input
          id="vendorCategory"
          placeholder="e.g. Office Supplies"
          value={filters.category ?? ""}
          onChange={(event) =>
            onChange({
              ...filters,
              category: event.target.value || undefined,
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
