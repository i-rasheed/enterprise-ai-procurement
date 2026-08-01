import type { LucideIcon } from "lucide-react";
import {
  BarChart3,
  CheckCircle2,
  FileText,
  LayoutDashboard,
  Package,
  Settings,
  ShoppingCart,
  UserCircle,
  Building2,
  Users,
} from "lucide-react";

import type { Role } from "@/lib/api/types";

export type NavItem = {
  title: string;
  href: string;
  icon: LucideIcon;
  roles?: Role[];
  badge?: string;
};

export const mainNavigation: NavItem[] = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Procurement",
    href: "/dashboard/procurement",
    icon: ShoppingCart,
    roles: ["ADMIN", "PROCUREMENT_MANAGER", "DEPARTMENT_HEAD", "USER"],
  },
  {
    title: "Approvals",
    href: "/dashboard/approvals",
    icon: CheckCircle2,
    roles: ["ADMIN", "DEPARTMENT_HEAD", "PROCUREMENT_MANAGER", "FINANCE"],
  },
  {
    title: "Vendors",
    href: "/dashboard/vendors",
    icon: Building2,
    roles: ["ADMIN", "PROCUREMENT_MANAGER", "FINANCE"],
  },
  {
    title: "Purchase Orders",
    href: "/dashboard/purchase-orders",
    icon: Package,
    roles: ["ADMIN", "PROCUREMENT_MANAGER", "FINANCE"],
  },
  {
    title: "Invoices",
    href: "/dashboard/invoices",
    icon: FileText,
    roles: ["ADMIN", "FINANCE", "PROCUREMENT_MANAGER"],
  },
  {
    title: "Organization",
    href: "/dashboard/organization",
    icon: Users,
    roles: ["ADMIN", "PROCUREMENT_MANAGER", "FINANCE", "DEPARTMENT_HEAD"],
  },
  {
    title: "Analytics",
    href: "/dashboard/analytics",
    icon: BarChart3,
    roles: ["ADMIN", "FINANCE", "PROCUREMENT_MANAGER"],
  },
  {
    title: "Settings",
    href: "/dashboard/settings",
    icon: Settings,
  },
  {
    title: "Profile",
    href: "/dashboard/profile",
    icon: UserCircle,
  },
];

export function filterNavigationByRole(
  items: NavItem[],
  role?: Role | null,
): NavItem[] {
  return items.filter((item) => {
    if (!item.roles || item.roles.length === 0) {
      return true;
    }

    if (!role) {
      return false;
    }

    return item.roles.includes(role);
  });
}
