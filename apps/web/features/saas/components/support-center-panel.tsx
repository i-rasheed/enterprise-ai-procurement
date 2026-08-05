"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PageHeader } from "@/components/shared/page-header";
import { UserGuideDownloadCard } from "@/components/shared/user-guide-download-card";
import { saasRepository } from "@/features/saas/api/saas.repository";

export function SupportCenterPanel() {
  const queryClient = useQueryClient();
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");

  const ticketsQuery = useQuery({
    queryKey: ["support", "tickets"],
    queryFn: () => saasRepository.listSupportTickets(),
  });

  const createMutation = useMutation({
    mutationFn: () => saasRepository.createSupportTicket({ subject, message }),
    onSuccess: () => {
      setSubject("");
      setMessage("");
      void queryClient.invalidateQueries({ queryKey: ["support", "tickets"] });
    },
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Support center"
        description="Open tickets for billing, onboarding, or product help."
      />

      <UserGuideDownloadCard />

      <Card>
        <CardHeader>
          <CardTitle>New ticket</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="subject">Subject</Label>
            <Input id="subject" value={subject} onChange={(e) => setSubject(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="message">Message</Label>
            <textarea
              id="message"
              rows={5}
              className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex min-h-[120px] w-full rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
          </div>
          <Button
            disabled={!subject || !message || createMutation.isPending}
            onClick={() => createMutation.mutate()}>
            Submit ticket
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Your tickets</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          {(ticketsQuery.data ?? []).length === 0 ? (
            <p className="text-muted-foreground">No tickets yet.</p>
          ) : (
            ticketsQuery.data.map((ticket: { id: string; subject: string; status: string }) => (
              <div key={ticket.id} className="flex items-center justify-between border-b pb-2">
                <span>{ticket.subject}</span>
                <span className="text-muted-foreground capitalize">{ticket.status.toLowerCase()}</span>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
