"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { Controller, useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Label } from "@/components/ui/label";
import {
  vendorLoginSchema,
  type VendorLoginFormValues,
} from "@/features/vendor-portal/schemas/vendor-portal.schema";
import { useVendorLogin } from "@/features/vendor-portal/hooks/use-vendor-portal";

export function VendorLoginForm() {
  const login = useVendorLogin();

  const form = useForm<VendorLoginFormValues>({
    resolver: zodResolver(vendorLoginSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: true,
    },
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Vendor sign in</CardTitle>
        <CardDescription>
          Access RFQs, submit bids, and manage orders with your vendor
          credentials. Your account email must match your vendor profile email.
        </CardDescription>
      </CardHeader>
      <form
        className="flex flex-col gap-6"
        onSubmit={form.handleSubmit((values) => login.mutate(values))}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="vendorEmail">Email</Label>
            <Input
              id="vendorEmail"
              type="email"
              autoComplete="email"
              placeholder="contact@globex-demo.com"
              {...form.register("email")}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="vendorPassword">Password</Label>
            <PasswordInput
              id="vendorPassword"
              autoComplete="current-password"
              placeholder="••••••••"
              {...form.register("password")}
            />
          </div>
          <div className="flex items-center gap-2">
            <Controller
              control={form.control}
              name="rememberMe"
              render={({ field }) => (
                <Checkbox
                  id="vendorRememberMe"
                  checked={field.value}
                  onCheckedChange={(checked) =>
                    field.onChange(checked === true)
                  }
                />
              )}
            />
            <Label htmlFor="vendorRememberMe">Remember me</Label>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Button type="submit" disabled={login.isPending} className="w-full sm:w-auto">
            {login.isPending ? "Signing in..." : "Sign in to vendor portal"}
          </Button>
          <Link
            href="/login"
            className="text-muted-foreground text-sm hover:underline"
          >
            Enterprise login
          </Link>
        </CardFooter>
      </form>
    </Card>
  );
}
