"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";

import { useAcceptInvitation } from "@/features/organization/hooks/use-organization";
import {
  acceptInvitationSchema,
  type AcceptInvitationFormValues,
} from "@/features/organization/schemas/organization.schema";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Label } from "@/components/ui/label";

export function AcceptInvitationForm() {
  const searchParams = useSearchParams();
  const tokenFromQuery = searchParams.get("token") ?? "";
  const acceptInvitation = useAcceptInvitation();

  const form = useForm<AcceptInvitationFormValues>({
    resolver: zodResolver(acceptInvitationSchema),
    defaultValues: {
      token: tokenFromQuery,
      firstName: "",
      lastName: "",
      password: "",
    },
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Accept invitation</CardTitle>
        <CardDescription>
          Complete your account to join the organisation.
        </CardDescription>
      </CardHeader>
      <form
        className="flex flex-col gap-6"
        onSubmit={form.handleSubmit((values) => acceptInvitation.mutate(values))}
      >
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="token">Invitation token</Label>
            <Input id="token" {...form.register("token")} />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="firstName">First name</Label>
              <Input id="firstName" {...form.register("firstName")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last name</Label>
              <Input id="lastName" {...form.register("lastName")} />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <PasswordInput
              id="password"
              autoComplete="new-password"
              {...form.register("password")}
            />
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-3">
          <Button
            type="submit"
            className="w-full"
            disabled={acceptInvitation.isPending}
          >
            {acceptInvitation.isPending ? "Creating account..." : "Accept invitation"}
          </Button>
          <Link href="/login" className="text-primary text-sm hover:underline">
            Already have an account? Sign in
          </Link>
        </CardFooter>
      </form>
    </Card>
  );
}
