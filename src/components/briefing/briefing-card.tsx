"use client";

import Link from "next/link";
import { motion } from "motion/react";

import { EmptyState } from "@/components/common/empty-state";
import { SourcesBlock } from "@/components/briefing/sources-block";
import { TopicSection } from "@/components/briefing/topic-section";
import { getSourceItems, getVisibleTopics, type SectionKey } from "@/lib/briefing-utils";
import { fadeInUp } from "@/lib/motion";
import type { Briefing } from "@/lib/types";
import { cn } from "@/lib/utils";

export function BriefingCard({
  briefing,
  section,
  highlight,
}: {
  briefing: Briefing;
  section: SectionKey;
  highlight?: boolean;
}) {
  const topics = getVisibleTopics(briefing, section);
  const sourceItems = getSourceItems(briefing, section);

  return (
    <motion.div variants={fadeInUp} className="flex flex-col gap-4">
      <Link
        href={`/briefing/${briefing.briefing_date}`}
        className={cn(
          "font-mono text-sm transition-colors hover:text-primary",
          highlight ? "text-primary" : "text-muted-foreground"
        )}
      >
        {briefing.briefing_date}
      </Link>

      {topics.length === 0 ? (
        <EmptyState>(no content for this section)</EmptyState>
      ) : (
        <div className="flex flex-col gap-6">
          {topics.map((t) => (
            <TopicSection key={t.key} label={t.label} text={t.text!} />
          ))}
        </div>
      )}

      <SourcesBlock items={sourceItems} />
    </motion.div>
  );
}
