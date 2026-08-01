import type { Metadata } from "next";

import { VendorLoginForm } from "@/features/vendor-portal/components/vendor-login-form";

export const metadata: Metadata = {
  title: "Vendor Login",
};

export default function VendorLoginPage() {
  return (
    <div className="bg-muted/30 flex min-h-screen items-center justify-center px-4 py-10">
      <div className="w-full max-w-md space-y-6">
        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">
            Vendor Portal
          </h1>
          <p className="text-muted-foreground text-sm">
            Sign in with the email registered on your vendor profile.
          </p>
        </div>
        <VendorLoginForm />
      </div>
    </div>
  );
}
