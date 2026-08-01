"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

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
import {
  canPublishRfq,
} from "@/features/rfqs/config/permissions";
import {
  publishRfqSchema,
  type PublishRfqFormValues,
} from "@/features/rfqs/schemas/rfq.schema";
import {
  useCancelRfq,
  useCloseRfq,
  usePublishRfq,
} from "@/features/rfqs/hooks/use-rfqs";
import type { RFQ } from "@/features/rfqs/types";

type RfqActionsPanelProps = {
  rfq: RFQ;
  canManage: boolean;
};

export function RfqActionsPanel({ rfq, canManage }: RfqActionsPanelProps) {
  const publishRfq = usePublishRfq(rfq.id);
  const closeRfq = useCloseRfq(rfq.id);
  const cancelRfq = useCancelRfq(rfq.id);

  const form = useForm<PublishRfqFormValues>({
    resolver: zodResolver(publishRfqSchema),
    defaultValues: { publicationNote: "" },
  });

  if (!canManage) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>RFQ actions</CardTitle>
        <CardDescription>
          Publish to vendors, close bidding, or cancel this RFQ.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {canPublishRfq(rfq) ? (
          <form
            className="space-y-3 rounded-lg border p-4"
            onSubmit={form.handleSubmit((values) => publishRfq.mutate(values))}
          >
            <p className="text-sm font-medium">Publish RFQ</p>
            <div className="space-y-2">
              <Label htmlFor="publicationNote">Publication note (optional)</Label>
              <Input
                id="publicationNote"
                placeholder="RFQ ready for vendor responses"
                {...form.register("publicationNote")}
              />
            </div>
            <Button type="submit" disabled={publishRfq.isPending}>
              {publishRfq.isPending ? "Publishing..." : "Publish RFQ"}
            </Button>
          </form>
        ) : rfq.status === "DRAFT" ? (
          <p className="text-muted-foreground text-sm">
            Invite at least one vendor before publishing.
          </p>
        ) : null}

        {rfq.status === "PUBLISHED" ? (
          <Button
            type="button"
            variant="outline"
            disabled={closeRfq.isPending}
            onClick={() => closeRfq.mutate()}
          >
            {closeRfq.isPending ? "Closing..." : "Close RFQ"}
          </Button>
        ) : null}

        {rfq.status === "DRAFT" || rfq.status === "PUBLISHED" ? (
          <Button
            type="button"
            variant="destructive"
            disabled={cancelRfq.isPending}
            onClick={() => {
              if (window.confirm("Cancel this RFQ?")) {
                cancelRfq.mutate();
              }
            }}
          >
            {cancelRfq.isPending ? "Cancelling..." : "Cancel RFQ"}
          </Button>
        ) : null}
      </CardContent>
    </Card>
  );
}
