"use client";

import { CheckCircle2, Clock } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { ContractVersion } from "@/features/contracts/types";

type ContractTimelineProps = {
  versions: ContractVersion[];
  isLoading?: boolean;
};

export function ContractTimeline({
  versions,
  isLoading,
}: ContractTimelineProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Timeline</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">Loading timeline...</p>
        </CardContent>
      </Card>
    );
  }

  const sorted = [...versions].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Timeline</CardTitle>
        <CardDescription>
          Contract version history and lifecycle events.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {sorted.length === 0 ? (
          <p className="text-muted-foreground py-6 text-center text-sm">
            No version history yet.
          </p>
        ) : (
          <ol className="space-y-4">
            {sorted.map((version, index) => (
              <li key={version.id} className="flex gap-4">
                <div className="flex flex-col items-center">
                  {index === sorted.length - 1 ? (
                    <Clock className="size-5 text-amber-600" />
                  ) : (
                    <CheckCircle2 className="size-5 text-emerald-600" />
                  )}
                  {index < sorted.length - 1 ? (
                    <div className="bg-border mt-2 h-full min-h-8 w-px" />
                  ) : null}
                </div>
                <div className="pb-4">
                  <p className="font-medium">Version {version.version}</p>
                  <p className="text-muted-foreground text-sm">
                    {version.changeSummary}
                  </p>
                  <p className="text-muted-foreground mt-1 text-xs">
                    {version.createdBy.firstName} {version.createdBy.lastName} ·{" "}
                    {new Date(version.createdAt).toLocaleString()}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        )}
      </CardContent>
    </Card>
  );
}

export function ContractVersionsPanel({
  versions,
  isLoading,
}: ContractTimelineProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Versions</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">Loading versions...</p>
        </CardContent>
      </Card>
    );
  }

  const sorted = [...versions].sort((a, b) => b.version - a.version);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Versions</CardTitle>
        <CardDescription>
          {sorted.length} version{sorted.length === 1 ? "" : "s"} recorded
        </CardDescription>
      </CardHeader>
      <CardContent>
        {sorted.length === 0 ? (
          <p className="text-muted-foreground text-sm">No versions yet.</p>
        ) : (
          <ul className="space-y-3">
            {sorted.map((version) => (
              <li
                key={version.id}
                className="rounded-lg border p-3 text-sm"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-medium">v{version.version}</span>
                  <span className="text-muted-foreground text-xs">
                    {new Date(version.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-muted-foreground mt-1">
                  {version.changeSummary}
                </p>
                <p className="text-muted-foreground mt-1 text-xs">
                  {version.createdBy.firstName} {version.createdBy.lastName}
                </p>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
