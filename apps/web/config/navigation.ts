import type { LucideIcon } from "lucide-react";
import {
  BarChart3,
  Bot,
  CheckCircle2,
  ClipboardCheck,
  CreditCard,
  FileSearch,
  FileSignature,
  FileText,
  Gavel,
  LayoutDashboard,
  LifeBuoy,
  Package,
  Rocket,
  Settings,
  Shield,
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
    title: "RFQs",
    href: "/dashboard/rfqs",
    icon: FileSearch,
    roles: ["ADMIN", "PROCUREMENT_MANAGER", "DEPARTMENT_HEAD", "FINANCE"],
  },
  {
    title: "Bids",
    href: "/dashboard/bids",
    icon: Gavel,
    roles: ["ADMIN", "PROCUREMENT_MANAGER", "FINANCE"],
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
    title: "Goods Receipts",
    href: "/dashboard/goods-receipts",
    icon: ClipboardCheck,
    roles: ["ADMIN", "PROCUREMENT_MANAGER", "USER"],
  },
  {
    title: "Invoices",
    href: "/dashboard/invoices",
    icon: FileText,
    roles: ["ADMIN", "FINANCE", "PROCUREMENT_MANAGER"],
  },
  {
    title: "Contracts",
    href: "/dashboard/contracts",
    icon: FileSignature,
    roles: ["ADMIN", "FINANCE", "PROCUREMENT_MANAGER", "USER"],
  },
  {
    title: "AI Assistant",
    href: "/dashboard/assistant",
    icon: Bot,
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
    title: "Billing",
    href: "/dashboard/billing",
    icon: CreditCard,
    roles: ["ADMIN"],
  },
  {
    title: "Support",
    href: "/dashboard/support",
    icon: LifeBuoy,
  },
  {
    title: "Onboarding",
    href: "/dashboard/onboarding",
    icon: Rocket,
    roles: ["ADMIN"],
  },
  {
    title: "Admin",
    href: "/dashboard/admin",
    icon: Shield,
    roles: ["ADMIN"],
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
