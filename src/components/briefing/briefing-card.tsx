import { EmptyState } from "@/components/common/empty-state";
import { TopicSection } from "@/components/briefing/topic-section";
import { getVisibleTopics, type SectionKey } from "@/lib/briefing-utils";
import type { Briefing } from "@/lib/types";

// The body of one date's accordion panel: one glass topic card per visible
// topic. The date itself lives in the accordion trigger, so this renders
// only the topic sections.
export function BriefingCard({
  briefing,
  section,
}: {
  briefing: Briefing;
  section: SectionKey;
}) {
  const topics = getVisibleTopics(briefing, section);

  if (topics.length === 0) {
    return <EmptyState>(no content for this section)</EmptyState>;
  }

  return (
    <div className="flex flex-col gap-6">
      {topics.map((t) => (
        <TopicSection key={t.key} label={t.label} text={t.text!} sources={t.sources} />
      ))}
    </div>
  );
}
