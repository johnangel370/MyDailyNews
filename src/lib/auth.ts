// Shared auth primitives used by the Edge middleware and the Node login /
// logout API routes. Web Crypto (crypto.subtle) is available in both
// runtimes on Next 14, so one copy serves everywhere.
export const COOKIE_NAME = "briefing_auth";
export const SALT = "daily-ai-briefing-v1";

export async function sha256Hex(text: string): Promise<string> {
  const data = new TextEncoder().encode(text);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

// The auth cookie value: hash of the site password. Rotating SITE_PASSWORD
// invalidates every issued cookie.
export async function expectedToken(): Promise<string> {
  return sha256Hex(`${SALT}:${process.env.SITE_PASSWORD || ""}`);
}
