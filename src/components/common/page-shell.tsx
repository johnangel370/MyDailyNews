import { cn } from "@/lib/utils";

export function PageShell({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <>
      {/* Simple tech gradient behind the content, mirroring the login page.
          Only authenticated pages use PageShell, so the login page keeps its
          own background. */}
      <div
        className="pointer-events-none fixed inset-0 -z-10 bg-gradient-to-br from-background via-background to-primary/10"
        aria-hidden
      />
      <div className={cn("mx-auto w-full max-w-3xl px-6 pb-16 pt-8", className)}>
        {children}
      </div>
    </>
  );
}
