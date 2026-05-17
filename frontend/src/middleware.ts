import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const publicPaths = ["/login", "/callback"];

export function middleware(request: NextRequest) {
  const token = request.cookies.get("token")?.value || "";
  const { pathname } = request.nextUrl;

  const isPublic = publicPaths.some((p) => pathname.startsWith(p));
  if (isPublic) {
    return NextResponse.next();
  }

  if (!token && pathname === "/") {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (!token && pathname.startsWith("/groups")) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (!token && pathname.startsWith("/teams")) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (!token && pathname.startsWith("/settings")) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
