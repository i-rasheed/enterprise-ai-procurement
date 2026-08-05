"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useForm } from "react-hook-form";

import { useForgotPassword } from "@/features/auth/hooks/use-auth";
import {
  forgotPasswordSchema,
  type ForgotPasswordFormValues,
} from "@/features/auth/schemas/auth.schema";
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
import { Label } from "@/components/ui/label";

export function ForgotPasswordForm() {
  const forgotPassword = useForgotPassword();

  const form = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Forgot password</CardTitle>
        <CardDescription>
          Enter your email and we&apos;ll send a reset link if an account
          exists.
        </CardDescription>
      </CardHeader>
      <form
        className="flex flex-col gap-6"
        onSubmit={form.handleSubmit((values) => forgotPassword.mutate(values))}
      >
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="admin@demo.com"
              {...form.register("email")}
            />
            {form.formState.errors.email ? (
              <p className="text-destructive text-sm">
                {form.formState.errors.email.message}
              </p>
            ) : null}
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <Button
            type="submit"
            className="w-full"
            disabled={forgotPassword.isPending}
          >
            {forgotPassword.isPending ? "Sending..." : "Send reset link"}
          </Button>
          <Link href="/login" className="text-primary text-sm hover:underline">
            Back to sign in
          </Link>
        </CardFooter>
      </form>
    </Card>
  );
}
