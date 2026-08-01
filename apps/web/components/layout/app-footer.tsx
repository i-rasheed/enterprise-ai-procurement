import Link from "next/link";

import { siteConfig } from "@/config/site";
import { Separator } from "@/components/ui/separator";

export function AppFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-background border-t">
      <div className="text-muted-foreground flex flex-col gap-4 px-4 py-6 text-sm md:flex-row md:items-center md:justify-between md:px-6">
        <p>
          © {year} {siteConfig.name}. All rights reserved.
        </p>
        <div className="flex flex-wrap items-center gap-4">
          <Link href="/dashboard" className="hover:text-foreground transition-colors">
            Dashboard
          </Link>
          <Separator orientation="vertical" className="hidden h-4 md:block" />
          <Link
            href={siteConfig.links.support}
            className="hover:text-foreground transition-colors"
          >
            Support
          </Link>
          <Separator orientation="vertical" className="hidden h-4 md:block" />
          <span className="text-xs">v0.1.0</span>
        </div>
      </div>
    </footer>
  );
}
