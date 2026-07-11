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
        "mb-3 border-b border-current/20 pb-1 font-newspaper text-lg font-bold sm:text-xl",
        accent ? "text-topic-accent" : "text-muted-foreground",
        className
      )}
    >
      {children}
    </div>
  );
}
