"use client";

import { createContext, useContext, useMemo, useState } from "react";

import type { SectionKey } from "@/lib/briefing-utils";
import type { Briefing } from "@/lib/types";

interface FilterContextValue {
  briefings: Briefing[];
  errorMsg: string;
  query: string;
  setQuery: (query: string) => void;
  section: SectionKey;
  setSection: (section: SectionKey) => void;
}

const FilterContext = createContext<FilterContextValue | null>(null);

// Holds the whole briefing list plus the search/section state. It lives in
// the shared (app) layout, which is never remounted while navigating between
// / and /briefing/[date], so the search box text and selected section are
// preserved across date switches ("保持不變"). Because the full list lives
// here, both the calendar's enabled dates and the shown content read from a
// single source — they can never disagree.
export function FilterProvider({
  briefings,
  errorMsg = "",
  children,
}: {
  briefings: Briefing[];
  errorMsg?: string;
  children: React.ReactNode;
}) {
  const [query, setQuery] = useState("");
  const [section, setSection] = useState<SectionKey>("all");

  const value = useMemo(
    () => ({ briefings, errorMsg, query, setQuery, section, setSection }),
    [briefings, errorMsg, query, section]
  );

  return <FilterContext.Provider value={value}>{children}</FilterContext.Provider>;
}

export function useFilter(): FilterContextValue {
  const ctx = useContext(FilterContext);
  if (!ctx) throw new Error("useFilter must be used within a FilterProvider");
  return ctx;
}
