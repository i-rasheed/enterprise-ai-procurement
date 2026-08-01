"use client";

import Link from "next/link";
import {
  Building2,
  FileText,
  Package,
  PlusCircle,
  ScrollText,
  ShoppingCart,
  Users,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const actions = [
  {
    label: "New procurement request",
    href: "/dashboard/procurement",
    icon: PlusCircle,
  },
  {
    label: "Manage vendors",
    href: "/dashboard/vendors",
    icon: Building2,
  },
  {
    label: "View purchase orders",
    href: "/dashboard/purchase-orders",
    icon: Package,
  },
  {
    label: "Review invoices",
    href: "/dashboard/invoices",
    icon: FileText,
  },
  {
    label: "Open contracts",
    href: "/dashboard/contracts",
    icon: ScrollText,
  },
  {
    label: "Team & invites",
    href: "/dashboard/team",
    icon: Users,
  },
];

export function QuickActionsPanel() {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="text-base">Quick actions</CardTitle>
        <CardDescription>Jump to common procurement workflows</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-2 sm:grid-cols-2">
        {actions.map((action) => {
          const Icon = action.icon;
          return (
            <Button
              key={action.href}
              asChild
              variant="outline"
              className="h-auto justify-start gap-2 px-3 py-3"
            >
              <Link href={action.href}>
                <Icon className="size-4 shrink-0" aria-hidden />
                <span className="text-left text-sm">{action.label}</span>
              </Link>
            </Button>
          );
        })}
        <Button
          asChild
          variant="secondary"
          className="h-auto justify-start gap-2 px-3 py-3 sm:col-span-2"
        >
          <Link href="/dashboard/procurement">
            <ShoppingCart className="size-4 shrink-0" aria-hidden />
            Browse procurement pipeline
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
