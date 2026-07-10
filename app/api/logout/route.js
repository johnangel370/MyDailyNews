import { NextResponse } from "next/server";

const COOKIE_NAME = "briefing_auth";

export async function POST(request) {
  const response = NextResponse.redirect(new URL("/login", request.url), {
    status: 303,
  });
  response.cookies.set(COOKIE_NAME, "", { maxAge: 0, path: "/" });
  return response;
}
