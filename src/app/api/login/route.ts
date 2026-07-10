import { NextResponse } from "next/server";
import { COOKIE_NAME, expectedToken } from "@/lib/auth";

export async function POST(request: Request) {
  const body = await request.formData().catch(() => null);
  const password = String(body?.get("password") || "");
  const rawNext = String(body?.get("next") || "/");
  // Only allow same-site relative paths to avoid an open redirect.
  const next = rawNext.startsWith("/") && !rawNext.startsWith("//") ? rawNext : "/";

  if (password !== (process.env.SITE_PASSWORD || "")) {
    const url = new URL("/login", request.url);
    url.searchParams.set("error", "1");
    url.searchParams.set("next", next);
    return NextResponse.redirect(url, { status: 303 });
  }

  const token = await expectedToken();
  const response = NextResponse.redirect(new URL(next, request.url), {
    status: 303,
  });
  response.cookies.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 30, // 30 days
    path: "/",
  });
  return response;
}
