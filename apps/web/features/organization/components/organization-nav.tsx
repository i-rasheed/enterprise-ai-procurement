"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

const tabs = [
  { href: "/dashboard/organization", label: "Profile", exact: true },
  { href: "/dashboard/organization/members", label: "Members" },
  { href: "/dashboard/organization/invitations", label: "Invitations" },
  { href: "/dashboard/organization/roles", label: "Roles & Permissions" },
  { href: "/dashboard/organization/settings", label: "Settings" },
];

export function OrganizationNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Organization sections"
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
