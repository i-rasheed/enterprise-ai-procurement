"use client";

import { AlertTriangle } from "lucide-react";
import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { env } from "@/lib/env";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
    Sentry.captureException(error);
  }, [error]);

  return (
    <html lang="en">
      <body className="bg-muted/30 flex min-h-screen items-center justify-center p-6">
        <Card className="w-full max-w-lg">
          <CardHeader>
            <div className="bg-destructive/10 text-destructive mb-2 flex size-10 items-center justify-center rounded-full">
              <AlertTriangle className="size-5" aria-hidden="true" />
            </div>
            <CardTitle>Something went wrong</CardTitle>
            <CardDescription>
              An unexpected error occurred. You can try again or return to the
              dashboard.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {env.isDevelopment ? (
              <pre className="bg-muted overflow-auto rounded-md p-3 text-xs">
                {error.message}
              </pre>
            ) : null}
          </CardContent>
          <CardFooter className="flex gap-2">
            <Button onClick={reset}>Try again</Button>
            <Button variant="outline" asChild>
              <a href="/dashboard">Go to dashboard</a>
            </Button>
          </CardFooter>
        </Card>
      </body>
    </html>
  );
}
