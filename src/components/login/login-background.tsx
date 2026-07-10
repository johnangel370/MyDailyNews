"use client";

import dynamic from "next/dynamic";

// three.js only ever loads on the login route, and only on the client.
const ShaderBackground = dynamic(
  () =>
    import("@/components/login/shader-background").then(
      (mod) => mod.ShaderBackground
    ),
  { ssr: false }
);

// Static gradient renders immediately (and stays as the fallback when the
// shader is disabled by prefers-reduced-motion or still loading).
export function LoginBackground() {
  return (
    <div className="absolute inset-0 -z-10 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-primary/10" />
      <ShaderBackground />
    </div>
  );
}
