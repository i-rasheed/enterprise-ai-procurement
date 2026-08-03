"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { BrandLogo } from "@/components/shared/brand-logo";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { filterNavigationByRole, mainNavigation } from "@/config/navigation";
import { cn, formatRole } from "@/lib/utils";
import { useAuthStore } from "@/stores/auth-store";

type AppSidebarProps = {
  onNavigate?: () => void;
  className?: string;
};

export function AppSidebar({ onNavigate, className }: AppSidebarProps) {
  const pathname = usePathname();
  const user = useAuthStore((state) => state.user);
  const organisation = useAuthStore((state) => state.organisation);
  const navItems = filterNavigationByRole(mainNavigation, user?.role);

  return (
    <aside
      className={cn(
        "bg-sidebar text-sidebar-foreground flex h-full w-64 flex-col border-r",
        className,
      )}
    >
      <div className="flex h-16 items-center gap-2 border-b px-4">
        <BrandLogo href="/dashboard" size="sm" />
        <div className="min-w-0">
          <p className="text-muted-foreground truncate text-xs">
            {organisation?.name ?? "Enterprise Procurement"}
          </p>
        </div>
      </div>

      <ScrollArea className="flex-1 px-3 py-4">
        <nav aria-label="Main navigation" className="space-y-1">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/dashboard" && pathname.startsWith(item.href));
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onNavigate}
                className={cn(
                  "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  isActive &&
                    "bg-sidebar-accent text-sidebar-accent-foreground",
                )}
                aria-current={isActive ? "page" : undefined}
              >
                <Icon className="size-4 shrink-0" aria-hidden="true" />
                <span className="truncate">{item.title}</span>
                {item.badge ? (
                  <Badge variant="secondary" className="ml-auto">
                    {item.badge}
                  </Badge>
                ) : null}
              </Link>
            );
          })}
        </nav>
      </ScrollArea>

      <div className="mt-auto border-t p-4">
        {user ? (
          <div className="space-y-1">
            <p className="truncate text-sm font-medium">
              {user.firstName} {user.lastName}
            </p>
            <p className="text-muted-foreground truncate text-xs">{user.email}</p>
            <Badge variant="outline" className="mt-2">
              {formatRole(user.role)}
            </Badge>
          </div>
        ) : null}
      </div>
    </aside>
  );
}
