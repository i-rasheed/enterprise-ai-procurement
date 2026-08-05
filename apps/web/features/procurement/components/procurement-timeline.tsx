"use client";

import { CheckCircle2, Circle, Clock, XCircle } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { TimelineEvent } from "@/features/procurement/types";

type ProcurementTimelineProps = {
  events: TimelineEvent[];
};

function TimelineIcon({ status }: { status?: TimelineEvent["status"] }) {
  switch (status) {
    case "completed":
      return <CheckCircle2 className="size-5 text-emerald-600" />;
    case "rejected":
      return <XCircle className="size-5 text-destructive" />;
    case "current":
      return <Clock className="size-5 text-amber-600" />;
    default:
      return <Circle className="text-muted-foreground size-5" />;
  }
}

export function ProcurementTimeline({ events }: ProcurementTimelineProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Timeline</CardTitle>
        <CardDescription>
          Request lifecycle and approval milestones.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {events.length === 0 ? (
          <p className="text-muted-foreground py-6 text-center text-sm">
            No timeline events yet.
          </p>
        ) : (
          <ol className="space-y-4">
            {events.map((event, index) => (
              <li key={event.id} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <TimelineIcon status={event.status} />
                  {index < events.length - 1 ? (
                    <div className="bg-border mt-2 h-full min-h-8 w-px" />
                  ) : null}
                </div>
                <div className="pb-4">
                  <p className="font-medium">{event.title}</p>
                  {event.description ? (
                    <p className="text-muted-foreground text-sm">
                      {event.description}
                    </p>
                  ) : null}
                  <p className="text-muted-foreground mt-1 text-xs">
                    {new Date(event.timestamp).toLocaleString()}
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
