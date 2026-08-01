"use client";

import { LogOut, Menu, Search } from "lucide-react";

import { AppSidebar } from "@/components/layout/app-sidebar";
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
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useLogout } from "@/features/auth/hooks/use-auth";
import { formatRole } from "@/lib/utils";
import { useAuthStore } from "@/stores/auth-store";

export function AppHeader() {
  const user = useAuthStore((state) => state.user);
  const logout = useLogout();

  const initials = user
    ? `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase()
    : "U";

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
            <SheetTitle>Navigation</SheetTitle>
          </SheetHeader>
          <AppSidebar className="w-full border-0" />
        </SheetContent>
      </Sheet>

      <div className="relative hidden max-w-md flex-1 md:block">
        <Search className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
        <Input
          type="search"
          placeholder="Search procurement, vendors, POs..."
          className="pl-9"
          aria-label="Search"
        />
      </div>

      <div className="ml-auto flex items-center gap-2">
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
                  {user ? `${user.firstName} ${user.lastName}` : "Guest"}
                </p>
                <p className="text-muted-foreground text-xs leading-none">
                  {user?.email}
                </p>
                {user ? (
                  <p className="text-muted-foreground pt-1 text-xs">
                    {formatRole(user.role)}
                  </p>
                ) : null}
              </div>
            </DropdownMenuLabel>
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
