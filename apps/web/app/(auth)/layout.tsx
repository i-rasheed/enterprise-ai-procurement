import Link from "next/link";

import { SkipLink } from "@/components/shared/skip-link";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { siteConfig } from "@/config/site";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex min-h-screen flex-col">
      <SkipLink />
      <header className="flex items-center justify-between px-4 py-4 md:px-6">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <span className="bg-primary text-primary-foreground flex size-8 items-center justify-center rounded-lg text-sm">
            PA
          </span>
          {siteConfig.name}
        </Link>
        <ThemeToggle />
      </header>
      <main
        id="main-content"
        className="flex flex-1 items-center justify-center px-4 py-8"
        tabIndex={-1}>
        <div className="w-full max-w-md">{children}</div>
      </main>
      <footer className="text-muted-foreground px-4 py-4 text-center text-xs md:px-6">
        Secure enterprise procurement platform
      </footer>
    </div>
  );
}
