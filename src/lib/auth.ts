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

// The auth cookie value for a role: a salted hash tied to that role's
// password (and namespaced by the role, so the two tokens never collide).
// Rotating a password invalidates every cookie issued for it.
export async function tokenForRole(role: Role): Promise<string> {
  const secret = role === "admin" ? adminPassword() : guestPassword();
  return sha256Hex(`${SALT}:${role}:${secret}`);
}

// Which role a submitted password authenticates as, or null. Admin wins ties
// (and an empty password never authenticates, even if a password is unset).
export async function roleForPassword(password: string): Promise<Role | null> {
  if (password && password === adminPassword()) return "admin";
  if (password && password === guestPassword()) return "guest";
  return null;
}

// Which role a cookie value represents, or null.
export async function roleForToken(
  cookie: string | undefined | null
): Promise<Role | null> {
  if (!cookie) return null;
  if (cookie === (await tokenForRole("admin"))) return "admin";
  if (cookie === (await tokenForRole("guest"))) return "guest";
  return null;
}
