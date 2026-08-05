import type { Metadata } from "next";
import { Suspense } from "react";

import { AcceptInvitationForm } from "@/features/organization/components/accept-invitation-form";

export const metadata: Metadata = {
  title: "Accept invitation",
};

export default function AcceptInvitationPage() {
  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <div className="w-full max-w-md">
        <Suspense fallback={<div className="bg-muted h-96 animate-pulse rounded-xl" />}>
          <AcceptInvitationForm />
        </Suspense>
      </div>
    </div>
  );
}
