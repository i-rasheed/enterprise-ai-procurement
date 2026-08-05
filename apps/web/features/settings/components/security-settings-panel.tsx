"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PasswordInput } from "@/components/ui/password-input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  useChangePassword,
  useRevokeAllSessions,
} from "@/features/auth/hooks/use-auth";
import {
  changePasswordSchema,
  type ChangePasswordFormValues,
} from "@/features/auth/schemas/auth.schema";

export function SecuritySettingsPanel() {
  const changePassword = useChangePassword();
  const revokeAllSessions = useRevokeAllSessions();

  const passwordForm = useForm<ChangePasswordFormValues>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Security</h2>
        <p className="text-muted-foreground text-sm">
          Manage your password and active sessions.
        </p>
      </div>

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
              <PasswordInput
                id="currentPassword"
                autoComplete="current-password"
                {...passwordForm.register("currentPassword")}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="newPassword">New password</Label>
              <PasswordInput
                id="newPassword"
                autoComplete="new-password"
                {...passwordForm.register("newPassword")}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm new password</Label>
              <PasswordInput
                id="confirmPassword"
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
