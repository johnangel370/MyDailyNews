import { NextResponse } from "next/server";

const COOKIE_NAME = "briefing_auth";
const SALT = "daily-ai-briefing-v1";

async function sha256Hex(text) {
  const data = new TextEncoder().encode(text);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function POST(request) {
  const body = await request.formData().catch(() => null);
  const password = body?.get("password") || "";
  const next = body?.get("next") || "/";

  if (password !== (process.env.SITE_PASSWORD || "")) {
    const url = new URL("/login", request.url);
    url.searchParams.set("error", "1");
    url.searchParams.set("next", String(next));
    return NextResponse.redirect(url, { status: 303 });
  }

  const token = await sha256Hex(`${SALT}:${password}`);
  const response = NextResponse.redirect(new URL(String(next), request.url), {
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
