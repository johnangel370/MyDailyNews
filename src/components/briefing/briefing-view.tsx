"use client";

import { BriefingCard } from "@/components/briefing/briefing-card";
import { useFilter } from "@/components/briefing/filter-context";
import { EmptyState } from "@/components/common/empty-state";

// The single-briefing reading view. With no `date` it shows the latest
// briefing (home); with a `date` it shows that day. Both the briefing data
// and the active section come from the shared FilterContext, so switching
// dates only re-renders here — the header and filter bar above stay put.
export function BriefingView({ date }: { date?: string }) {
  const { briefings, errorMsg, section } = useFilter();

  if (errorMsg) {
    return <EmptyState>Could not load briefings: {errorMsg}</EmptyState>;
  }

  const briefing = date
    ? briefings.find((b) => b.briefing_date === date)
    : briefings[0];

  if (!briefing) {
    return <EmptyState>No briefing found for this date.</EmptyState>;
  }

  return (
    <div>
      <h2 className="mb-8 font-display text-3xl font-black tracking-tight text-topic-accent">
        {briefing.briefing_date}
      </h2>
      <BriefingCard briefing={briefing} section={section} />
    </div>
  );
}
