import type { Metadata } from "next";

import { RegisterPendingPanel } from "@/features/auth/components/register-pending-panel";

export const metadata: Metadata = {
  title: "Verify email",
};

export default function RegisterPendingPage() {
  return <RegisterPendingPanel />;
}
