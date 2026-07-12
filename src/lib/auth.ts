// Shared auth primitives used by the Edge middleware and the Node login /
// logout API routes. Web Crypto (crypto.subtle) is available in both
// runtimes on Next 14, so one copy serves everywhere.
export const COOKIE_NAME = "briefing_auth";
const SALT = "daily-ai-briefing-v1";

// Two access levels:
//   admin -- full access (SITE_PASSWORD).
//   guest -- read-only, latest briefing only (GUEST_PASSWORD, default "guest").
export type Role = "admin" | "guest";

export async function sha256Hex(text: string): Promise<string> {
  const data = new TextEncoder().encode(text);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function adminPassword(): string {
  return process.env.SITE_PASSWORD || "";
}

function guestPassword(): string {
  return process.env.GUEST_PASSWORD || "guest";
}

function secretFor(role: Role): string {
  return role === "admin" ? adminPassword() : guestPassword();
}

// Idle session length in ms (default 30 minutes; SESSION_MINUTES overrides).
export function sessionMs(): number {
  const min = Number(process.env.SESSION_MINUTES);
  return (Number.isFinite(min) && min > 0 ? min : 30) * 60 * 1000;
}

// Keyed hash binding the role + expiry to the role's password. The secret is
// placed LAST so the digest is not vulnerable to length-extension forgery,
// and rotating the password invalidates every token issued for it.
async function sign(role: Role, expiresAt: string): Promise<string> {
  return sha256Hex(`${SALT}:${role}:${expiresAt}:${secretFor(role)}`);
}

// A fresh cookie value: "<role>.<expiresAt>.<signature>", where expiresAt is
// now + the idle window. Re-minted on each request (see middleware) so an
// active session slides forward; an idle one lapses once expiresAt passes.
export async function mintToken(role: Role): Promise<string> {
  const expiresAt = String(Date.now() + sessionMs());
  const sig = await sign(role, expiresAt);
  return `${role}.${expiresAt}.${sig}`;
}

// Which role a submitted password authenticates as, or null. Admin wins ties
// (and an empty password never authenticates, even if a password is unset).
export async function roleForPassword(password: string): Promise<Role | null> {
  if (password && password === adminPassword()) return "admin";
  if (password && password === guestPassword()) return "guest";
  return null;
}

// Which role a cookie represents, or null -- valid only if the signature
// matches AND the token has not expired.
export async function roleForToken(
  cookie: string | undefined | null
): Promise<Role | null> {
  if (!cookie) return null;
  const parts = cookie.split(".");
  if (parts.length !== 3) return null;
  const [role, expiresAt, sig] = parts;
  if (role !== "admin" && role !== "guest") return null;

  const expiry = Number(expiresAt);
  if (!Number.isFinite(expiry) || Date.now() >= expiry) return null;

  const expected = await sign(role, expiresAt);
  if (sig !== expected) return null;
  return role;
}

// Cookie attributes shared by login (mint) and middleware (refresh). It is a
// session cookie (no maxAge) so it also clears when the browser closes; the
// 30-minute idle limit is enforced by the signed expiry embedded in the value.
export function sessionCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
  };
}
