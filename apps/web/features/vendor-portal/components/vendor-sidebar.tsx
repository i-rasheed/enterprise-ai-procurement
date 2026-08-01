"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bot,
  FileSearch,
  FileSignature,
  FileText,
  Gavel,
  LayoutDashboard,
  Package,
  UserCircle,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { vendorPortalNavigation } from "@/features/vendor-portal/config/navigation";

const iconMap = {
  LayoutDashboard,
  FileSearch,
  Gavel,
  Package,
  FileText,
  FileSignature,
  Bot,
  UserCircle,
};

type VendorSidebarProps = {
  className?: string;
  vendorName?: string;
};

export function VendorSidebar({ className, vendorName }: VendorSidebarProps) {
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        "bg-card flex h-full w-64 flex-col border-r",
        className,
      )}
    >
      <div className="border-b p-4">
        <p className="text-primary text-sm font-semibold uppercase tracking-wide">
          Vendor Portal
        </p>
        <p className="text-muted-foreground mt-1 truncate text-sm">
          {vendorName ?? "Supplier workspace"}
        </p>
      </div>

      <nav className="flex-1 space-y-1 p-3" aria-label="Vendor navigation">
        {vendorPortalNavigation.map((item) => {
          const Icon = iconMap[item.icon];
          const isActive =
            item.href === "/vendor"
              ? pathname === "/vendor"
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              <Icon className="size-4 shrink-0" />
              {item.title}
            </Link>
          );
        })}
      </nav>

      <div className="border-t p-4">
        <Link
          href="/dashboard"
          className="text-muted-foreground hover:text-foreground text-xs underline-offset-4 hover:underline"
        >
          Switch to enterprise dashboard
        </Link>
      </div>
    </aside>
  );
}
