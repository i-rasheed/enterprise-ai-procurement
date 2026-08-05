"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";

import {
  useInviteMember,
  useOrganization,
} from "@/features/organization/hooks/use-organization";
import {
  inviteMemberSchema,
  type InviteMemberFormValues,
} from "@/features/organization/schemas/organization.schema";
import { ASSIGNABLE_ROLES, ROLE_LABELS } from "@/features/organization/config/permissions";
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

type InviteMemberFormProps = {
  organisationId: string;
};

export function InviteMemberForm({ organisationId }: InviteMemberFormProps) {
  const [open, setOpen] = useState(false);
  const inviteMember = useInviteMember(organisationId);

  const form = useForm<InviteMemberFormValues>({
    resolver: zodResolver(inviteMemberSchema),
    defaultValues: {
      email: "",
      role: "USER",
    },
  });

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-4">
        <div>
          <CardTitle className="text-base">Invite member</CardTitle>
          <CardDescription>
            Send an email invitation with an assigned role.
          </CardDescription>
        </div>
        <Button
          type="button"
          variant={open ? "outline" : "default"}
          onClick={() => setOpen((value) => !value)}
        >
          {open ? "Close" : "New invitation"}
        </Button>
      </CardHeader>
      {open ? (
        <CardContent>
          <form
            className="grid gap-4 sm:grid-cols-2"
            onSubmit={form.handleSubmit((values) => {
              inviteMember.mutate(values, {
                onSuccess: () => {
                  form.reset({ email: "", role: "USER" });
                  setOpen(false);
                },
              });
            })}
          >
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="inviteEmail">Email</Label>
              <Input
                id="inviteEmail"
                type="email"
                placeholder="colleague@company.com"
                {...form.register("email")}
              />
              {form.formState.errors.email ? (
                <p className="text-destructive text-sm">
                  {form.formState.errors.email.message}
                </p>
              ) : null}
            </div>
            <div className="space-y-2">
              <Label htmlFor="inviteRole">Role</Label>
              <select
                id="inviteRole"
                className="border-input bg-background flex h-9 w-full rounded-md border px-3 text-sm"
                {...form.register("role")}
              >
                {ASSIGNABLE_ROLES.map((role) => (
                  <option key={role} value={role}>
                    {ROLE_LABELS[role]}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-end">
              <Button type="submit" disabled={inviteMember.isPending}>
                {inviteMember.isPending ? "Sending..." : "Send invitation"}
              </Button>
            </div>
          </form>
        </CardContent>
      ) : null}
    </Card>
  );
}

export function InviteMemberPanel() {
  const { data: organization } = useOrganization();

  if (!organization) {
    return null;
  }

  return <InviteMemberForm organisationId={organization.id} />;
}
