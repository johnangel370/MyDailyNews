import { NextResponse } from "next/server";
import { COOKIE_NAME, roleForPassword, tokenForRole } from "@/lib/auth";

export async function POST(request: Request) {
  const body = await request.formData().catch(() => null);
  const password = String(body?.get("password") || "");
  const rawNext = String(body?.get("next") || "/");
  // Only allow same-site relative paths to avoid an open redirect.
  const next = rawNext.startsWith("/") && !rawNext.startsWith("//") ? rawNext : "/";

  const role = await roleForPassword(password);
  if (!role) {
    const url = new URL("/login", request.url);
    url.searchParams.set("error", "1");
    url.searchParams.set("next", next);
    return NextResponse.redirect(url, { status: 303 });
  }

  // Guests are confined to the home page regardless of the requested `next`.
  const dest = role === "guest" ? "/" : next;
  const token = await tokenForRole(role);
  const response = NextResponse.redirect(new URL(dest, request.url), {
    status: 303,
  });
  response.cookies.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    // Session cookie (no maxAge/expires): it is dropped when the browser is
    // closed, so every new browser session requires logging in again.
    path: "/",
  });
  return response;
}
