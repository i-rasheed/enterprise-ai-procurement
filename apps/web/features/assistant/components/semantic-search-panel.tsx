"use client";

import { useState } from "react";
import { Loader2, Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { useSemanticSearch } from "../hooks/use-assistant";
import type { EmbeddingEntityType, SemanticSearchResult } from "../types";
import { RelevantRecordsList } from "./relevant-records-list";

const ENTITY_TYPES: EmbeddingEntityType[] = [
  "CONTRACT",
  "RFQ",
  "PURCHASE_ORDER",
  "INVOICE",
  "PROCUREMENT_REQUEST",
  "BID",
];

export function SemanticSearchPanel() {
  const searchMutation = useSemanticSearch();
  const [query, setQuery] = useState("");
  const [selectedTypes, setSelectedTypes] = useState<EmbeddingEntityType[]>([]);
  const [results, setResults] = useState<SemanticSearchResult[]>([]);

  const toggleType = (type: EmbeddingEntityType) => {
    setSelectedTypes((current) =>
      current.includes(type)
        ? current.filter((item) => item !== type)
        : [...current, type],
    );
  };

  const handleSearch = async () => {
    const trimmed = query.trim();
    if (!trimmed) return;

    const response = await searchMutation.mutateAsync({
      query: trimmed,
      entityTypes: selectedTypes.length > 0 ? selectedTypes : undefined,
      limit: 12,
    });
    setResults(response.results);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Search className="size-5" />
          Semantic search
        </CardTitle>
        <CardDescription>
          Search procurement records by meaning — contracts, RFQs, purchase
          orders, invoices, requests, and bids.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_auto]">
          <div className="space-y-2">
            <Label htmlFor="semanticQuery">Search query</Label>
            <Input
              id="semanticQuery"
              placeholder="e.g. payment terms renewal clause"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  void handleSearch();
                }
              }}
            />
          </div>
          <div className="flex items-end">
            <Button
              type="button"
              onClick={() => void handleSearch()}
              disabled={searchMutation.isPending || !query.trim()}
            >
              {searchMutation.isPending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Search className="size-4" />
              )}
              Search
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <Label>Entity types</Label>
          <div className="flex flex-wrap gap-2">
            {ENTITY_TYPES.map((type) => {
              const active = selectedTypes.includes(type);
              return (
                <Button
                  key={type}
                  type="button"
                  size="sm"
                  variant={active ? "default" : "outline"}
                  onClick={() => toggleType(type)}
                >
                  {type.replaceAll("_", " ")}
                </Button>
              );
            })}
          </div>
          <p className="text-muted-foreground text-xs">
            Leave all unselected to search across every entity type.
          </p>
        </div>

        {results.length > 0 ? (
          <RelevantRecordsList records={results} />
        ) : searchMutation.isSuccess ? (
          <p className="text-muted-foreground text-sm">
            No matching records found. Try a different query or broaden entity
            filters.
          </p>
        ) : null}
      </CardContent>
    </Card>
  );
}
