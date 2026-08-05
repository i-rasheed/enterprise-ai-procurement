"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useForm } from "react-hook-form";

import { useRegister } from "@/features/auth/hooks/use-auth";
import {
  registerSchema,
  type RegisterFormValues,
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
import { PasswordInput } from "@/components/ui/password-input";
import { Label } from "@/components/ui/label";

export function RegisterForm() {
  const registerMutation = useRegister();

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      organisationName: "",
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      rememberMe: true,
    },
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create organisation</CardTitle>
        <CardDescription>
          Register your company and admin account to start managing procurement.
        </CardDescription>
      </CardHeader>
      <form
        className="flex flex-col gap-6"
        onSubmit={form.handleSubmit((values) =>
          registerMutation.mutate(values),
        )}
      >
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="organisationName">Organisation name</Label>
            <Input
              id="organisationName"
              placeholder="Acme Corp"
              aria-invalid={Boolean(form.formState.errors.organisationName)}
              {...form.register("organisationName")}
            />
            {form.formState.errors.organisationName ? (
              <p className="text-destructive text-sm">
                {form.formState.errors.organisationName.message}
              </p>
            ) : null}
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="firstName">First name</Label>
              <Input
                id="firstName"
                autoComplete="given-name"
                {...form.register("firstName")}
              />
              {form.formState.errors.firstName ? (
                <p className="text-destructive text-sm">
                  {form.formState.errors.firstName.message}
                </p>
              ) : null}
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last name</Label>
              <Input
                id="lastName"
                autoComplete="family-name"
                {...form.register("lastName")}
              />
              {form.formState.errors.lastName ? (
                <p className="text-destructive text-sm">
                  {form.formState.errors.lastName.message}
                </p>
              ) : null}
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Work email</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="admin@acme.com"
              {...form.register("email")}
            />
            {form.formState.errors.email ? (
              <p className="text-destructive text-sm">
                {form.formState.errors.email.message}
              </p>
            ) : null}
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <PasswordInput
              id="password"
              autoComplete="new-password"
              {...form.register("password")}
            />
            {form.formState.errors.password ? (
              <p className="text-destructive text-sm">
                {form.formState.errors.password.message}
              </p>
            ) : null}
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <Button
            type="submit"
            className="w-full"
            disabled={registerMutation.isPending}
          >
            {registerMutation.isPending ? "Creating account..." : "Create account"}
          </Button>
          <p className="text-muted-foreground text-center text-sm">
            Already have an account?{" "}
            <Link href="/login" className="text-primary hover:underline">
              Sign in
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}
