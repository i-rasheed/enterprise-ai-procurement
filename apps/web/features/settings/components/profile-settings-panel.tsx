"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { Badge } from "@/components/ui/badge";
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
import {
  useResendVerification,
  useUpdateProfile,
} from "@/features/auth/hooks/use-auth";
import {
  profileSchema,
  type ProfileFormValues,
} from "@/features/auth/schemas/auth.schema";
import { formatRole } from "@/lib/utils";
import { useAuthStore } from "@/stores/auth-store";

export function ProfileSettingsPanel() {
  const user = useAuthStore((state) => state.user);
  const updateProfile = useUpdateProfile();
  const resendVerification = useResendVerification();

  const profileForm = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    values: {
      firstName: user?.firstName ?? "",
      lastName: user?.lastName ?? "",
    },
  });

  if (!user) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Profile</h2>
        <p className="text-muted-foreground text-sm">
          Manage your account details and verification status.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Account</CardTitle>
          <CardDescription>
            Your personal information and role within the organisation.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline">{formatRole(user.role)}</Badge>
            <Badge variant={user.isVerified ? "secondary" : "destructive"}>
              {user.isVerified ? "Email verified" : "Email not verified"}
            </Badge>
          </div>

          {!user.isVerified ? (
            <div className="bg-muted/40 flex flex-col gap-3 rounded-lg border p-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm">
                Verify your email to unlock all procurement workflows.
              </p>
              <Button
                variant="outline"
                onClick={() => resendVerification.mutate()}
                disabled={resendVerification.isPending}
              >
                {resendVerification.isPending
                  ? "Sending..."
                  : "Resend verification"}
              </Button>
            </div>
          ) : null}

          <form
            className="space-y-4"
            onSubmit={profileForm.handleSubmit((values) =>
              updateProfile.mutate(values),
            )}
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="firstName">First name</Label>
                <Input id="firstName" {...profileForm.register("firstName")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last name</Label>
                <Input id="lastName" {...profileForm.register("lastName")} />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="profileEmail">Email</Label>
              <Input id="profileEmail" value={user.email} disabled />
            </div>
            <Button type="submit" disabled={updateProfile.isPending}>
              {updateProfile.isPending ? "Saving..." : "Save profile"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
