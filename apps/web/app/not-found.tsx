import Link from "next/link";
import { FileQuestion } from "lucide-react";

import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <div className="w-full max-w-lg space-y-4 text-center">
        <EmptyState
          icon={FileQuestion}
          title="Page not found"
          description="The page you are looking for does not exist or may have been moved."
          action={{ label: "Back to dashboard", href: "/dashboard" }}
        />
        <Button variant="outline" asChild>
          <Link href="/login">Sign in</Link>
        </Button>
      </div>
    </div>
  );
}
