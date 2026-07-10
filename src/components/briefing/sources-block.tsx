import type { SourceItem } from "@/lib/briefing-utils";

export function SourcesBlock({ items }: { items: SourceItem[] }) {
  if (items.length === 0) return null;

  return (
    <details className="mt-4 border-t pt-3">
      <summary className="cursor-pointer text-xs text-muted-foreground hover:text-foreground">
        Sources
      </summary>
      <div className="mt-2 flex flex-col gap-3">
        {items.map((item, i) => (
          <div key={item.label ?? i}>
            {item.label && (
              <div className="mb-1 text-[11px] font-medium uppercase tracking-wide text-muted-foreground/70">
                {item.label}
              </div>
            )}
            <div className="whitespace-pre-wrap break-words text-xs text-muted-foreground">
              {item.text}
            </div>
          </div>
        ))}
      </div>
    </details>
  );
}
