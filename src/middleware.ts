import NextAuth from "next-auth";
import { authConfig } from "@/auth.config";
import { NextResponse } from "next/server";

const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;
  const role = req.auth?.user?.role;

  const path = nextUrl.pathname;

  const isAdminRoute = path.startsWith("/admin");
  const isVendorRoute =
    path.startsWith("/vendor") &&
    path !== "/vendor/register" &&
    path !== "/vendor/pending";
  const isAccountRoute =
    path.startsWith("/account") ||
    path === "/checkout" ||
    path === "/cart" ||
    path.startsWith("/orders");

  // /admin/* — ADMIN only
  if (isAdminRoute) {
    if (!isLoggedIn || role !== "ADMIN") {
      return NextResponse.redirect(new URL("/login", nextUrl));
    }
  }

  // /vendor/* — VENDOR role only
  if (isVendorRoute) {
    if (!isLoggedIn || role !== "VENDOR") {
      return NextResponse.redirect(new URL("/login", nextUrl));
    }
  }

  // /account/*, /checkout — any authenticated user
  if (isAccountRoute && !isLoggedIn) {
    return NextResponse.redirect(new URL("/login", nextUrl));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/admin/:path*", "/vendor/:path*", "/account/:path*", "/checkout", "/cart", "/orders/:path*"],
};