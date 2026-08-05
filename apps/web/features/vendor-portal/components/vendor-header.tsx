"use client";

import { LogOut, Menu } from "lucide-react";
import Link from "next/link";

import { ThemeToggle } from "@/components/shared/theme-toggle";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useLogout } from "@/features/auth/hooks/use-auth";
import { VendorSidebar } from "@/features/vendor-portal/components/vendor-sidebar";
import { useAuthStore } from "@/stores/auth-store";

type VendorHeaderProps = {
  vendorName?: string;
};

export function VendorHeader({ vendorName }: VendorHeaderProps) {
  const user = useAuthStore((state) => state.user);
  const logout = useLogout();

  const initials = user
    ? `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase()
    : "V";

  return (
    <header className="bg-background/95 supports-[backdrop-filter]:bg-background/60 sticky top-0 z-40 flex h-16 items-center gap-4 border-b px-4 backdrop-blur md:px-6">
      <Sheet>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            aria-label="Open navigation menu"
          >
            <Menu className="size-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-72 p-0">
          <SheetHeader className="sr-only">
            <SheetTitle>Vendor navigation</SheetTitle>
          </SheetHeader>
          <VendorSidebar className="w-full border-0" vendorName={vendorName} />
        </SheetContent>
      </Sheet>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{vendorName}</p>
        <p className="text-muted-foreground truncate text-xs">
          {user?.email}
        </p>
      </div>

      <div className="flex items-center gap-2">
        <ThemeToggle />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="relative size-9 rounded-full p-0"
              aria-label="Open user menu"
            >
              <Avatar className="size-9">
                <AvatarFallback>{initials}</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <div className="flex flex-col space-y-1">
                <p className="text-sm leading-none font-medium">
                  {user ? `${user.firstName} ${user.lastName}` : "Vendor"}
                </p>
                <p className="text-muted-foreground text-xs leading-none">
                  {user?.email}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/vendor/profile">Profile</Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              variant="destructive"
              onClick={() => logout.mutate()}
              disabled={logout.isPending}
            >
              <LogOut className="size-4" />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
