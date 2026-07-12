"use client";

import { useFilter } from "@/components/briefing/filter-context";
import { SearchResults } from "@/components/briefing/search-results";
import { TopicArchive } from "@/components/briefing/topic-archive";

// Below the persistent filter bar, three mutually exclusive modes:
//   1. search box has text  -> cross-date SearchResults (highlighted).
//   2. a specific section   -> cross-date TopicArchive (paginated).
//   3. otherwise            -> the page's current-day content (children).
// The `key`s reset each view's pagination to page 1 when the query/section
// changes.
export function ContentSwitcher({ children }: { children: React.ReactNode }) {
  const { query, section } = useFilter();

  if (query.trim()) return <SearchResults key={query.trim()} />;
  if (section !== "all") return <TopicArchive key={section} section={section} />;
  return <>{children}</>;
}
