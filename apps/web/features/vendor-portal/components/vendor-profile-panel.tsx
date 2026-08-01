"use client";

import { ProfileSettingsPanel } from "@/features/settings/components/profile-settings-panel";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useVendorContextStore } from "@/features/vendor-portal/stores/vendor-context-store";

export function VendorProfilePanel() {
  const vendor = useVendorContextStore((state) => state.vendor);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Vendor profile</CardTitle>
          <CardDescription>
            Company details linked to your portal account.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 text-sm md:grid-cols-2">
          <div>
            <p className="text-muted-foreground">Company</p>
            <p className="font-medium">{vendor?.name}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Vendor email</p>
            <p className="font-medium">{vendor?.email}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Category</p>
            <p className="font-medium">{vendor?.category ?? "—"}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Status</p>
            <p className="font-medium">{vendor?.status}</p>
          </div>
        </CardContent>
      </Card>

      <ProfileSettingsPanel />
    </div>
  );
}
