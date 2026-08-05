"use client";

import Link from "next/link";
import { ExternalLink } from "lucide-react";

import { Badge } from "@/components/ui/badge";

import type { SemanticSearchResult } from "../types";
import { formatEntityType, getEntityRoute } from "../utils/entity-links";

type RelevantRecordsListProps = {
  records: SemanticSearchResult[];
};

export function RelevantRecordsList({ records }: RelevantRecordsListProps) {
  return (
    <div className="space-y-2 text-left">
      <p className="text-muted-foreground text-xs font-medium uppercase tracking-wide">
        Relevant records
      </p>
      <div className="space-y-2">
        {records.map((record) => (
          <Link
            key={`${record.entityType}-${record.entityId}`}
            href={getEntityRoute(record.entityType, record.entityId)}
            className="hover:bg-accent block rounded-lg border p-3 transition-colors"
          >
            <div className="mb-1 flex items-center gap-2">
              <Badge variant="secondary">
                {formatEntityType(record.entityType)}
              </Badge>
              <span className="text-muted-foreground text-xs">
                {(record.score * 100).toFixed(0)}% match
              </span>
              <ExternalLink className="text-muted-foreground ml-auto size-3.5" />
            </div>
            <p className="text-muted-foreground line-clamp-2 text-xs">
              {record.snippet}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
