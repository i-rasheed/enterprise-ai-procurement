"use client";

import { Search, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  CONTRACT_TYPES,
  type ContractFilters,
  type ContractStatus,
} from "@/features/contracts/types";

const STATUS_OPTIONS: { value: ContractStatus | ""; label: string }[] = [
  { value: "", label: "All statuses" },
  { value: "DRAFT", label: "Draft" },
  { value: "UNDER_REVIEW", label: "Under review" },
  { value: "ACTIVE", label: "Active" },
  { value: "EXPIRED", label: "Expired" },
  { value: "TERMINATED", label: "Terminated" },
  { value: "RENEWED", label: "Renewed" },
];

type ContractFiltersPanelProps = {
  filters: ContractFilters;
  onChange: (filters: ContractFilters) => void;
  onReset: () => void;
};

export function ContractFiltersPanel({
  filters,
  onChange,
  onReset,
}: ContractFiltersPanelProps) {
  const hasActiveFilters = Boolean(
    filters.search || filters.status || filters.contractType,
  );

  return (
    <Card>
      <CardContent className="flex flex-wrap items-end gap-4 pt-6">
        <div className="min-w-[220px] flex-1 space-y-2">
          <Label htmlFor="contract-search">Search</Label>
          <div className="relative">
            <Search className="text-muted-foreground absolute top-2.5 left-2.5 size-4" />
            <Input
              id="contract-search"
              placeholder="Contract number, title, vendor..."
              className="pl-9"
              value={filters.search ?? ""}
              onChange={(event) =>
                onChange({ ...filters, search: event.target.value, page: 1 })
              }
            />
          </div>
        </div>

        <div className="min-w-[160px] space-y-2">
          <Label htmlFor="contract-status">Status</Label>
          <select
            id="contract-status"
            className="border-input bg-background ring-offset-background focus-visible:ring-ring flex h-9 w-full rounded-md border px-3 py-1 text-sm shadow-xs focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
            value={filters.status ?? ""}
            onChange={(event) =>
              onChange({
                ...filters,
                status: (event.target.value as ContractStatus) || undefined,
                page: 1,
              })
            }
          >
            {STATUS_OPTIONS.map((option) => (
              <option key={option.value || "all"} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="min-w-[160px] space-y-2">
          <Label htmlFor="contract-type">Type</Label>
          <select
            id="contract-type"
            className="border-input bg-background ring-offset-background focus-visible:ring-ring flex h-9 w-full rounded-md border px-3 py-1 text-sm shadow-xs focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
            value={filters.contractType ?? ""}
            onChange={(event) =>
              onChange({
                ...filters,
                contractType:
                  (event.target.value as ContractFilters["contractType"]) ||
                  undefined,
                page: 1,
              })
            }
          >
            <option value="">All types</option>
            {CONTRACT_TYPES.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>

        {hasActiveFilters ? (
          <Button type="button" variant="ghost" onClick={onReset}>
            <X className="size-4" />
            Reset
          </Button>
        ) : null}
      </CardContent>
    </Card>
  );
}
