import { auth } from "@/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;
  const isAdmin = req.auth?.user?.role === "ADMIN";

  // Protect admin routes
  if (nextUrl.pathname.startsWith("/admin")) {
    if (!isLoggedIn) {
      return NextResponse.redirect(new URL("/login", nextUrl));
    }
    if (!isAdmin) {
      return NextResponse.redirect(new URL("/", nextUrl));
    }
  }

  // Protect account routes
  if (nextUrl.pathname.startsWith("/account")) {
    if (!isLoggedIn) {
      return NextResponse.redirect(
        new URL(`/login?callbackUrl=${nextUrl.pathname}`, nextUrl)
      );
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/admin/:path*", "/account/:path*"],
};
