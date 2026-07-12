"use client";

import { useFilter } from "@/components/briefing/filter-context";
import { SearchResults } from "@/components/briefing/search-results";

// Below the persistent filter bar: show cross-date search results while the
// search box has text, otherwise the page's current-day content (children).
export function ContentSwitcher({ children }: { children: React.ReactNode }) {
  const { query } = useFilter();
  return query.trim() ? <SearchResults /> : <>{children}</>;
}
