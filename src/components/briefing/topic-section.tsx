import { MarkdownContent } from "@/components/common/markdown-content";
import { HighlightText } from "@/components/common/highlight-text";
import { SectionHeading } from "@/components/common/section-heading";
import { TopicSources } from "@/components/briefing/topic-sources";
import { Card, CardContent } from "@/components/ui/card";
import { filterNewsItems, parseNewsItems } from "@/lib/briefing-utils";

// One AI-topic block: the topic name sits OUTSIDE the card (SectionHeading,
// topic-accent color), and the glass card holds the numbered news items
// plus that topic's collapsible sources. Shared by the list and detail
// pages so both stay identical.
//
// When `highlight` is set (search mode), only the news items matching the
// query are shown and the query is highlighted in titles and bodies.
export function TopicSection({
  label,
  text,
  sources,
  highlight,
}: {
  label: string;
  text: string;
  sources?: string | null;
  highlight?: string;
}) {
  const allItems = parseNewsItems(text);
  const items = highlight?.trim()
    ? filterNewsItems(allItems, highlight)
    : allItems;
  // Only number when there are genuinely multiple titled news items.
  const numbered = items.length > 1 && items.some((it) => it.title);

  if (items.length === 0) return null;

  return (
    <section>
      <SectionHeading accent>{label}</SectionHeading>
      <Card variant="glass">
        <CardContent className="pt-6">
          <ol className="flex flex-col gap-6">
            {items.map((item, i) => (
              <li key={i} className="flex gap-3">
                {numbered && (
                  <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-topic-accent/15 font-mono text-xs font-semibold text-topic-accent">
                    {i + 1}
                  </span>
                )}
                <div className="min-w-0 flex-1">
                  {item.title && (
                    <h4 className="mb-1 font-display text-base font-semibold">
                      <HighlightText text={item.title} query={highlight} />
                    </h4>
                  )}
                  {item.body && (
                    <MarkdownContent highlight={highlight}>
                      {item.body}
                    </MarkdownContent>
                  )}
                </div>
              </li>
            ))}
          </ol>
          {sources && <TopicSources sources={sources} />}
        </CardContent>
      </Card>
    </section>
  );
}
