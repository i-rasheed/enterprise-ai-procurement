"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

const tabs = [
  { href: "/dashboard/approvals", label: "Queue", exact: true },
  { href: "/dashboard/approvals/history", label: "History" },
  { href: "/dashboard/approvals/notifications", label: "Notifications" },
  { href: "/dashboard/approvals/audit", label: "Audit trail" },
];

export function ApprovalsNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Approval sections"
      className="flex flex-wrap gap-2 border-b pb-4"
    >
      {tabs.map((tab) => {
        const isActive = tab.exact
          ? pathname === tab.href
          : pathname.startsWith(tab.href);

        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={cn(
              "rounded-md px-3 py-2 text-sm font-medium transition-colors",
              isActive
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
            aria-current={isActive ? "page" : undefined}
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
