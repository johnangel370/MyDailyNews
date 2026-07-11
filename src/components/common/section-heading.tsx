import { cn } from "@/lib/utils";

export function SectionHeading({
  children,
  accent,
  className,
}: {
  children: React.ReactNode;
  accent?: boolean;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "mb-3 font-display text-xs font-medium uppercase tracking-widest",
        accent ? "text-topic-accent" : "text-muted-foreground",
        className
      )}
    >
      {children}
    </div>
  );
}
