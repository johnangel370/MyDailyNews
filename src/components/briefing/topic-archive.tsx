"use client";

import { useMemo, useState } from "react";

import { useFilter } from "@/components/briefing/filter-context";
import { TopicSection } from "@/components/briefing/topic-section";
import { EmptyState } from "@/components/common/empty-state";
import { Pager } from "@/components/common/pager";
import { getVisibleTopics, type SectionKey } from "@/lib/briefing-utils";

const PAGE_SIZE = 10;

// Cross-date archive for one topic: every date that has that section, newest
// first, one card per day, 10 days per page. Shown when a specific section is
// picked in the dropdown (empty search).
export function TopicArchive({
  section,
}: {
  section: Exclude<SectionKey, "all">;
}) {
  const { briefings } = useFilter();
  const [page, setPage] = useState(1);

  // briefings already arrive newest-first from getAllBriefings().
  const dated = useMemo(
    () => briefings.filter((b) => b[section]),
    [briefings, section]
  );

  if (dated.length === 0) {
    return <EmptyState>No briefings for this topic yet.</EmptyState>;
  }

  const totalPages = Math.ceil(dated.length / PAGE_SIZE);
  const currentPage = Math.min(page, totalPages);
  const start = (currentPage - 1) * PAGE_SIZE;
  const visible = dated.slice(start, start + PAGE_SIZE);

  return (
    <div>
      <div className="flex flex-col gap-10">
        {visible.map((b) => (
          <div key={b.id}>
            <h2 className="mb-6 font-newspaper text-2xl font-black tracking-tight text-topic-accent">
              {b.briefing_date}
            </h2>
            {getVisibleTopics(b, section).map((t) => (
              <TopicSection
                key={t.key}
                label={t.label}
                text={t.text!}
                sources={t.sources}
              />
            ))}
          </div>
        ))}
      </div>
      <Pager page={currentPage} totalPages={totalPages} onPageChange={setPage} />
    </div>
  );
}
