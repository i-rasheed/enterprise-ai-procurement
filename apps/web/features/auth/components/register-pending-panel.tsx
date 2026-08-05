"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

import { authRepository } from "@/features/auth/api/auth.repository";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getErrorMessage } from "@/lib/api";

export function RegisterPendingPanel() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email") ?? "";

  const resend = useMutation({
    mutationFn: () => authRepository.resendRegistrationVerification(email),
    onSuccess: (data) => {
      toast.success(data.message);
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Verify your work email</CardTitle>
        <CardDescription>
          {email
            ? `We sent a verification link to ${email}. Your organisation will be created after you confirm your email.`
            : "We sent a verification link to your work email. Your organisation will be created after you confirm your email."}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3 text-sm text-muted-foreground">
        <p>The organisation name is reserved for 72 hours while you verify.</p>
        <p>Check your inbox and spam folder, then click the link to continue.</p>
      </CardContent>
      <CardFooter className="flex flex-col gap-3 sm:flex-row">
        {email ? (
          <Button
            type="button"
            variant="outline"
            disabled={resend.isPending}
            onClick={() => resend.mutate()}
          >
            {resend.isPending ? "Sending..." : "Resend verification email"}
          </Button>
        ) : null}
        <Button asChild variant="secondary">
          <Link href="/login">Back to sign in</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
