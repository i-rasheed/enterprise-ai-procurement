"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";

import { EmptyState } from "@/components/shared/empty-state";
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
import { Skeleton } from "@/components/ui/skeleton";
import { useOrganization } from "@/features/organization/hooks/use-organization";
import {
  brandingSchema,
  type BrandingFormValues,
} from "@/features/settings/schemas/settings.schema";
import {
  useBrandingPreferences,
  useSaveBrandingPreferences,
} from "@/features/settings/hooks/use-settings";
import { canManageBranding } from "@/features/settings/config/permissions";
import {
  fromBrandingFormValues,
  toBrandingFormValues,
} from "@/features/settings/utils/branding-form";
import { useAuthStore } from "@/stores/auth-store";

export function BrandingSettingsPanel() {
  const userRole = useAuthStore((state) => state.user?.role);
  const organisationId = useAuthStore((state) => state.organisation?.id);
  const organizationQuery = useOrganization();
  const brandingQuery = useBrandingPreferences(organisationId);
  const saveBranding = useSaveBrandingPreferences(organisationId);
  const canEdit = canManageBranding(userRole);

  const form = useForm<BrandingFormValues>({
    resolver: zodResolver(brandingSchema),
    defaultValues: {
      displayName: "",
      tagline: "",
      logoUrl: "",
      primaryColor: "#2563eb",
    },
  });

  useEffect(() => {
    if (!brandingQuery.data || !organizationQuery.data) {
      return;
    }

    form.reset(
      toBrandingFormValues(
        brandingQuery.data,
        organizationQuery.data.name,
      ),
    );
  }, [brandingQuery.data, organizationQuery.data, form]);

  if (!canEdit) {
    return (
      <EmptyState
        title="Access restricted"
        description="Branding settings can be managed by administrators and procurement managers."
      />
    );
  }

  if (brandingQuery.isLoading || organizationQuery.isLoading) {
    return <Skeleton className="h-96 w-full" />;
  }

  const watched = form.watch();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Branding</h2>
        <p className="text-muted-foreground text-sm">
          Customize how your organisation appears in the workspace. Branding is
          stored locally until backend branding APIs are enabled.
        </p>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
        <Card>
          <CardHeader>
            <CardTitle>Brand identity</CardTitle>
            <CardDescription>
              Configure display name, tagline, logo, and accent color.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form
              className="space-y-4"
              onSubmit={form.handleSubmit((values) =>
                saveBranding.mutate(fromBrandingFormValues(values)),
              )}
            >
              <div className="space-y-2">
                <Label htmlFor="displayName">Display name</Label>
                <Input id="displayName" {...form.register("displayName")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tagline">Tagline</Label>
                <Input
                  id="tagline"
                  placeholder="Enterprise procurement, simplified"
                  {...form.register("tagline")}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="logoUrl">Logo URL</Label>
                <Input
                  id="logoUrl"
                  placeholder="https://example.com/logo.png"
                  {...form.register("logoUrl")}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="primaryColor">Primary color</Label>
                <div className="flex gap-3">
                  <Input
                    id="primaryColor"
                    type="color"
                    className="h-10 w-16 shrink-0 p-1"
                    {...form.register("primaryColor")}
                  />
                  <Input {...form.register("primaryColor")} />
                </div>
              </div>
              <Button type="submit" disabled={saveBranding.isPending}>
                {saveBranding.isPending ? "Saving..." : "Save branding"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Preview</CardTitle>
            <CardDescription>How branding will appear in the app.</CardDescription>
          </CardHeader>
          <CardContent>
            <div
              className="rounded-xl border p-4"
              style={{ borderColor: watched.primaryColor }}
            >
              <div className="mb-3 flex items-center gap-3">
                {watched.logoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={watched.logoUrl}
                    alt=""
                    className="size-10 rounded-md object-cover"
                  />
                ) : (
                  <div
                    className="flex size-10 items-center justify-center rounded-md text-sm font-bold text-white"
                    style={{ backgroundColor: watched.primaryColor }}
                  >
                    {watched.displayName?.charAt(0) ?? "P"}
                  </div>
                )}
                <div>
                  <p className="font-semibold">
                    {watched.displayName || organizationQuery.data?.name}
                  </p>
                  {watched.tagline ? (
                    <p className="text-muted-foreground text-xs">
                      {watched.tagline}
                    </p>
                  ) : null}
                </div>
              </div>
              <Button
                type="button"
                size="sm"
                style={{ backgroundColor: watched.primaryColor }}
              >
                Primary action
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
