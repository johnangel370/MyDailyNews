/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    // Never reuse the client-side Router Cache entry for dynamically
    // rendered pages. Without this, navigating between /briefing/[date]
    // URLs can show a previously-cached date's content (the URL/heading
    // update from the param, but the body stays stale). 0 forces a fresh
    // fetch on every navigation.
    staleTimes: { dynamic: 0 },
  },
};

export default nextConfig;
