"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { useUpdateOrganization } from "@/features/organization/hooks/use-organization";
import {
  organizationProfileSchema,
  type OrganizationProfileFormValues,
} from "@/features/organization/schemas/organization.schema";
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
import type { Organization } from "@/features/organization/types";

type OrganizationProfileFormProps = {
  organization: Organization;
  canEdit: boolean;
};

export function OrganizationProfileForm({
  organization,
  canEdit,
}: OrganizationProfileFormProps) {
  const updateOrganization = useUpdateOrganization();

  const form = useForm<OrganizationProfileFormValues>({
    resolver: zodResolver(organizationProfileSchema),
    values: { name: organization.name },
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Organization profile</CardTitle>
        <CardDescription>
          Manage your tenant display name and identifiers.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="orgId">Organization ID</Label>
          <Input id="orgId" value={organization.id} disabled />
        </div>
        <form
          className="space-y-4"
          onSubmit={form.handleSubmit((values) =>
            updateOrganization.mutate(values),
          )}
        >
          <div className="space-y-2">
            <Label htmlFor="orgName">Organization name</Label>
            <Input
              id="orgName"
              disabled={!canEdit || updateOrganization.isPending}
              {...form.register("name")}
            />
            {form.formState.errors.name ? (
              <p className="text-destructive text-sm">
                {form.formState.errors.name.message}
              </p>
            ) : null}
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Created</Label>
              <Input
                value={new Date(organization.createdAt).toLocaleString()}
                disabled
              />
            </div>
            <div className="space-y-2">
              <Label>Last updated</Label>
              <Input
                value={new Date(organization.updatedAt).toLocaleString()}
                disabled
              />
            </div>
          </div>
          {canEdit ? (
            <Button type="submit" disabled={updateOrganization.isPending}>
              {updateOrganization.isPending ? "Saving..." : "Save profile"}
            </Button>
          ) : null}
        </form>
      </CardContent>
    </Card>
  );
}
