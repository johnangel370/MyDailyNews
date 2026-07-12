import { NextResponse, type NextRequest } from "next/server";
import {
  COOKIE_NAME,
  mintToken,
  roleForToken,
  sessionCookieOptions,
} from "@/lib/auth";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Always allow the login page and the login API route through.
  if (pathname.startsWith("/login") || pathname.startsWith("/api/login")) {
    return NextResponse.next();
  }

  const cookie = request.cookies.get(COOKIE_NAME)?.value;
  const role = await roleForToken(cookie);

  if (!role) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Guests may only see the home page (the latest briefing) and log out;
  // any other path (e.g. a specific /briefing/[date]) is bounced to "/".
  if (role === "guest" && pathname !== "/" && pathname !== "/api/logout") {
    return NextResponse.redirect(new URL("/", request.url));
  }

  const response = NextResponse.next();
  // Sliding session: every authenticated request pushes the 30-minute idle
  // window forward by re-issuing the cookie with a fresh expiry. Skip the
  // logout route so we don't re-set the cookie it is trying to clear.
  if (pathname !== "/api/logout") {
    response.cookies.set(COOKIE_NAME, await mintToken(role), sessionCookieOptions());
  }
  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
