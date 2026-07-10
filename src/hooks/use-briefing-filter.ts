"use client";

import { useMemo } from "react";

import { matchesQuery, type SectionKey } from "@/lib/briefing-utils";
import type { Briefing } from "@/lib/types";

export function useBriefingFilter(
  briefings: Briefing[],
  query: string,
  section: SectionKey
): Briefing[] {
  return useMemo(() => {
    return briefings.filter((b) => {
      if (!matchesQuery(b, query)) return false;
      if (section !== "all" && !b[section]) return false;
      return true;
    });
  }, [briefings, query, section]);
}
