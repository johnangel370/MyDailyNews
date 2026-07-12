"use client";

import { useRouter } from "next/navigation";

import { useFilter } from "@/components/briefing/filter-context";
import { EmptyState } from "@/components/common/empty-state";
import { useBriefingFilter } from "@/hooks/use-briefing-filter";

// Cross-date search results, shown in place of the current-day view while the
// search box is non-empty. Reuses useBriefingFilter (query + section) to pick
// matching dates. Selecting one clears the search and navigates to that day.
export function SearchResults() {
  const router = useRouter();
  const { briefings, query, section, setQuery } = useFilter();
  const matches = useBriefingFilter(briefings, query, section);

  if (matches.length === 0) {
    return <EmptyState>No briefings match &ldquo;{query}&rdquo;.</EmptyState>;
  }

  const openDate = (date: string) => {
    setQuery("");
    router.push(`/briefing/${date}`);
  };

  return (
    <div>
      <p className="mb-4 text-sm text-muted-foreground">
        {matches.length} {matches.length === 1 ? "date" : "dates"} match
      </p>
      <ul className="flex flex-col divide-y divide-border">
        {matches.map((b) => (
          <li key={b.id}>
            <button
              type="button"
              onClick={() => openDate(b.briefing_date)}
              className="w-full py-3 text-left font-newspaper text-xl font-bold text-topic-accent hover:underline"
            >
              {b.briefing_date}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
