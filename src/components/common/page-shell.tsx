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
      {/* Vintage newspaper surface, fixed to the viewport behind the content.
          Only authenticated pages use PageShell, so the login page is
          unaffected. */}
      <div className="paper-surface pointer-events-none fixed inset-0 -z-10" aria-hidden />
      <div className={cn("mx-auto w-full max-w-3xl px-6 pb-16 pt-8", className)}>
        {children}
      </div>
    </>
  );
}
