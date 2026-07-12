"use client";

import { useMemo, useState } from "react";

import { useFilter } from "@/components/briefing/filter-context";
import { TopicSection } from "@/components/briefing/topic-section";
import { EmptyState } from "@/components/common/empty-state";
import { Pager } from "@/components/common/pager";
import {
  filterNewsItems,
  getVisibleTopics,
  parseNewsItems,
  type Topic,
} from "@/lib/briefing-utils";
import type { Briefing } from "@/lib/types";

const PAGE_SIZE = 10;

// Cross-date search results: each date with a match shows its matching topic
// cards, expanded in place with the query highlighted. Respects the section
// dropdown (search within that topic, or all topics when "all"). The query is
// never cleared here, so it stays in the search box. Paginated 10 days/page.
export function SearchResults() {
  const { briefings, query, section } = useFilter();
  const [page, setPage] = useState(1);

  const matches = useMemo(() => {
    const q = query.trim();
    if (!q) return [] as { briefing: Briefing; topics: Topic[] }[];
    return briefings
      .map((briefing) => ({
        briefing,
        topics: getVisibleTopics(briefing, section).filter(
          (t) => filterNewsItems(parseNewsItems(t.text!), q).length > 0
        ),
      }))
      .filter((r) => r.topics.length > 0);
  }, [briefings, query, section]);

  if (matches.length === 0) {
    return (
      <EmptyState>
        No news matches &ldquo;{query.trim()}&rdquo;.
      </EmptyState>
    );
  }

  const totalPages = Math.ceil(matches.length / PAGE_SIZE);
  const currentPage = Math.min(page, totalPages);
  const start = (currentPage - 1) * PAGE_SIZE;
  const visible = matches.slice(start, start + PAGE_SIZE);

  return (
    <div>
      <p className="mb-6 text-sm text-muted-foreground">
        {matches.length} {matches.length === 1 ? "date" : "dates"} match
      </p>
      <div className="flex flex-col gap-10">
        {visible.map(({ briefing, topics }) => (
          <div key={briefing.id}>
            <h2 className="mb-6 font-newspaper text-2xl font-black tracking-tight text-topic-accent">
              {briefing.briefing_date}
            </h2>
            {topics.map((t) => (
              <TopicSection
                key={t.key}
                label={t.label}
                text={t.text!}
                sources={t.sources}
                highlight={query}
              />
            ))}
          </div>
        ))}
      </div>
      <Pager page={currentPage} totalPages={totalPages} onPageChange={setPage} />
    </div>
  );
}
