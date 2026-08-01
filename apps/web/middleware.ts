import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { SESSION_COOKIE } from "@/lib/auth/session";

const protectedPrefixes = ["/dashboard"];
const guestOnlyPaths = ["/login", "/register", "/forgot-password"];
const vendorLoginPath = "/vendor/login";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasSession = request.cookies.get(SESSION_COOKIE)?.value === "1";

  const isProtected = protectedPrefixes.some((prefix) =>
    pathname.startsWith(prefix),
  );
  const isGuestOnly = guestOnlyPaths.some((path) => pathname === path);
  const isVendorRoute = pathname.startsWith("/vendor");
  const isVendorLogin = pathname === vendorLoginPath;
  const isVendorProtected = isVendorRoute && !isVendorLogin;

  if (isProtected && !hasSession) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isVendorProtected && !hasSession) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = vendorLoginPath;
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isGuestOnly && hasSession) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  if (isVendorLogin && hasSession) {
    return NextResponse.redirect(new URL("/vendor", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/vendor/:path*",
    "/login",
    "/register",
    "/forgot-password",
  ],
};
