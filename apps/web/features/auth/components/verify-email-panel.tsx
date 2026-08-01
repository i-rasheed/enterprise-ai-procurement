"use client";

import Link from "next/link";
import { useEffect } from "react";

import { useVerifyEmail } from "@/features/auth/hooks/use-auth";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

type VerifyEmailPanelProps = {
  token: string;
};

export function VerifyEmailPanel({ token }: VerifyEmailPanelProps) {
  const verifyEmail = useVerifyEmail();

  useEffect(() => {
    if (token) {
      verifyEmail.mutate(token);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- run once per token
  }, [token]);

  if (!token) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Invalid verification link</CardTitle>
          <CardDescription>
            The verification token is missing from this link.
          </CardDescription>
        </CardHeader>
        <CardFooter className="flex gap-2">
          <Button asChild variant="outline">
            <Link href="/login">Sign in</Link>
          </Button>
          <Button asChild>
            <Link href="/dashboard/profile">Go to profile</Link>
          </Button>
        </CardFooter>
      </Card>
    );
  }

  if (verifyEmail.isPending) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-7 w-48" />
          <Skeleton className="h-4 w-full" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-10 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (verifyEmail.isSuccess) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Email verified</CardTitle>
          <CardDescription>
            Your email address has been verified successfully.
          </CardDescription>
        </CardHeader>
        <CardFooter>
          <Button asChild>
            <Link href="/dashboard">Continue to dashboard</Link>
          </Button>
        </CardFooter>
      </Card>
    );
  }

  if (verifyEmail.isError) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Verification failed</CardTitle>
          <CardDescription>
            This link may be expired or already used. Request a new verification
            email from your profile.
          </CardDescription>
        </CardHeader>
        <CardFooter className="flex gap-2">
          <Button asChild variant="outline">
            <Link href="/login">Sign in</Link>
          </Button>
          <Button asChild>
            <Link href="/dashboard/profile">Go to profile</Link>
          </Button>
        </CardFooter>
      </Card>
    );
  }

  return null;
}
