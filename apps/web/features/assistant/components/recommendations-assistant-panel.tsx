"use client";

import { useState } from "react";
import { Sparkles } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { ProcurementRecommendationsPanel } from "@/features/bids/components/procurement-recommendations-panel";
import { useProcurementRequests } from "@/features/procurement/hooks/use-procurement";

export function RecommendationsAssistantPanel() {
  const requestsQuery = useProcurementRequests({
    page: 1,
    limit: 100,
    status: "APPROVED",
  });
  const [requestId, setRequestId] = useState("");

  const requests = requestsQuery.data?.requests ?? [];
  const selectedRequestId = requestId || requests[0]?.id || "";

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="size-5" />
            Recommendations
          </CardTitle>
          <CardDescription>
            Generate vendor and procurement strategy recommendations for approved
            requests.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="requestSelect">Procurement request</Label>
            {requestsQuery.isLoading ? (
              <Skeleton className="h-9 w-full" />
            ) : (
              <select
                id="requestSelect"
                className="border-input bg-background flex h-9 w-full rounded-md border px-3 text-sm"
                value={selectedRequestId}
                onChange={(event) => setRequestId(event.target.value)}
              >
                {requests.length === 0 ? (
                  <option value="">No approved requests available</option>
                ) : (
                  requests.map((request) => (
                    <option key={request.id} value={request.id}>
                      {request.title} ({request.department})
                    </option>
                  ))
                )}
              </select>
            )}
          </div>
        </CardContent>
      </Card>

      {selectedRequestId ? (
        <ProcurementRecommendationsPanel
          procurementRequestId={selectedRequestId}
          canRequest
        />
      ) : null}
    </div>
  );
}
