"use client";

import { AlertTriangle } from "lucide-react";
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

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <div className="bg-destructive/10 text-destructive mb-2 flex size-10 items-center justify-center rounded-full">
            <AlertTriangle className="size-5" aria-hidden="true" />
          </div>
          <CardTitle>Unable to load this page</CardTitle>
          <CardDescription>
            Something went wrong while rendering the dashboard view.
          </CardDescription>
        </CardHeader>
        {env.isDevelopment ? (
          <CardContent>
            <pre className="bg-muted overflow-auto rounded-md p-3 text-xs">
              {error.message}
            </pre>
          </CardContent>
        ) : null}
        <CardFooter className="flex gap-2">
          <Button onClick={reset}>Try again</Button>
          <Button variant="outline" asChild>
            <a href="/dashboard">Back to dashboard</a>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
