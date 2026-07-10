// Shared constant used by middleware.js and the login/logout API routes to
// name the auth cookie consistently. The actual hashing logic is duplicated
// inline in each of those files because Next.js Edge middleware and Node API
// routes each need their own self-contained copy of the Web Crypto call.
const COOKIE_NAME = "briefing_auth";
const SALT = "daily-ai-briefing-v1";

module.exports = { COOKIE_NAME, SALT };
