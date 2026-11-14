import NextAuth from "next-auth";
import { NextResponse } from "next/server";
import { authConfig } from "@/auth/config";

// Optimistic check only (cookie, no database): the real authorization
// happens in every page / server action through src/auth/guards.ts.
const { auth } = NextAuth(authConfig);

export default auth((req) => {
  if (!req.auth) {
    const url = new URL("/login", req.url);
    url.searchParams.set("callbackUrl", req.nextUrl.pathname);
    return NextResponse.redirect(url);
  }
});

export const config = { matcher: ["/admin/:path*", "/account/:path*"] };
