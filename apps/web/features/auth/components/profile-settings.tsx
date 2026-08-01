"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import {
  useChangePassword,
  useResendVerification,
  useRevokeAllSessions,
  useUpdateProfile,
} from "@/features/auth/hooks/use-auth";
import {
  changePasswordSchema,
  profileSchema,
  type ChangePasswordFormValues,
  type ProfileFormValues,
} from "@/features/auth/schemas/auth.schema";
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
import { Separator } from "@/components/ui/separator";
import { formatRole } from "@/lib/utils";
import { useAuthStore } from "@/stores/auth-store";

export function ProfileSettings() {
  const user = useAuthStore((state) => state.user);
  const updateProfile = useUpdateProfile();
  const changePassword = useChangePassword();
  const resendVerification = useResendVerification();
  const revokeAllSessions = useRevokeAllSessions();

  const profileForm = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    values: {
      firstName: user?.firstName ?? "",
      lastName: user?.lastName ?? "",
    },
  });

  const passwordForm = useForm<ChangePasswordFormValues>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  if (!user) {
    return null;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>
            Manage your account details and verification status.
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

      <Card>
        <CardHeader>
          <CardTitle>Password</CardTitle>
          <CardDescription>Update your account password.</CardDescription>
        </CardHeader>
        <CardContent>
          <form
            className="space-y-4"
            onSubmit={passwordForm.handleSubmit((values) => {
              changePassword.mutate(values, {
                onSuccess: () => passwordForm.reset(),
              });
            })}
          >
            <div className="space-y-2">
              <Label htmlFor="currentPassword">Current password</Label>
              <Input
                id="currentPassword"
                type="password"
                autoComplete="current-password"
                {...passwordForm.register("currentPassword")}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="newPassword">New password</Label>
              <Input
                id="newPassword"
                type="password"
                autoComplete="new-password"
                {...passwordForm.register("newPassword")}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm new password</Label>
              <Input
                id="confirmPassword"
                type="password"
                autoComplete="new-password"
                {...passwordForm.register("confirmPassword")}
              />
            </div>
            <Button type="submit" disabled={changePassword.isPending}>
              {changePassword.isPending ? "Updating..." : "Change password"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Session management</CardTitle>
          <CardDescription>
            Sign out from all devices if you suspect unauthorized access.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground text-sm">
            This revokes all refresh tokens and ends active sessions across
            browsers and devices.
          </p>
          <Separator />
          <Button
            variant="destructive"
            onClick={() => revokeAllSessions.mutate()}
            disabled={revokeAllSessions.isPending}
          >
            {revokeAllSessions.isPending
              ? "Revoking..."
              : "Sign out all sessions"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
