import type { Metadata } from "next";

import { VerifyEmailPanel } from "@/features/auth/components/verify-email-panel";

export const metadata: Metadata = {
  title: "Verify email",
};

type VerifyEmailPageProps = {
  searchParams: Promise<{ token?: string }>;
};

export default async function VerifyEmailPage({
  searchParams,
}: VerifyEmailPageProps) {
  const params = await searchParams;

  return <VerifyEmailPanel token={params.token ?? ""} />;
}
