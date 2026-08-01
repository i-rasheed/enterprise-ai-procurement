"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import {
  useDeleteOrganizationWithConfirm,
  useOrganization,
} from "@/features/organization/hooks/use-organization";
import {
  deleteOrganizationSchema,
  type DeleteOrganizationFormValues,
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
import { Separator } from "@/components/ui/separator";

export function OrganizationSettingsForm() {
  const { data: organization } = useOrganization();
  const deleteOrganization = useDeleteOrganizationWithConfirm();

  const form = useForm<DeleteOrganizationFormValues>({
    resolver: zodResolver(deleteOrganizationSchema),
    defaultValues: { confirmName: "" },
  });

  if (!organization) {
    return null;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>General settings</CardTitle>
          <CardDescription>
            Organisation-level preferences and configuration.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p>
            <span className="font-medium">Tenant:</span> {organization.name}
          </p>
          <p>
            <span className="font-medium">Members:</span>{" "}
            {organization.users.length}
          </p>
          <p className="text-muted-foreground">
            Manage notification delivery from Settings → Notifications.
          </p>
        </CardContent>
      </Card>

      <Card className="border-destructive/40">
        <CardHeader>
          <CardTitle className="text-destructive">Danger zone</CardTitle>
          <CardDescription>
            Permanently delete this organisation and all associated users.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            className="space-y-4"
            onSubmit={form.handleSubmit((values) =>
              deleteOrganization.mutateWithConfirm(organization.name, values),
            )}
          >
            <Separator />
            <div className="space-y-2">
              <Label htmlFor="confirmName">
                Type <strong>{organization.name}</strong> to confirm
              </Label>
              <Input
                id="confirmName"
                placeholder={organization.name}
                {...form.register("confirmName")}
              />
              {form.formState.errors.confirmName ? (
                <p className="text-destructive text-sm">
                  {form.formState.errors.confirmName.message}
                </p>
              ) : null}
            </div>
            <Button
              type="submit"
              variant="destructive"
              disabled={deleteOrganization.isPending}
            >
              {deleteOrganization.isPending
                ? "Deleting..."
                : "Delete organisation"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
