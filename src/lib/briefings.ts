import { unstable_noStore as noStore } from "next/cache";

import { getSupabaseServerClient } from "@/lib/supabase";
import type { Briefing } from "@/lib/types";

const BRIEFING_COLUMNS =
  "id, briefing_date, cv_section, llm_section, multimodal_section, sources, cv_sources, llm_sources, multimodal_sources, raw_markdown, created_at";

export async function getAllBriefings(): Promise<Briefing[]> {
  // Force an uncached read on every request. Without this, Next/Vercel can
  // serve a stale cached result (e.g. a date list frozen before the newest
  // briefing existed), which greys out valid days in the calendar.
  noStore();
  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase
    .from("briefings")
    .select(BRIEFING_COLUMNS)
    .order("briefing_date", { ascending: false })
    .limit(365);

  if (error) throw new Error(error.message);
  return (data ?? []) as unknown as Briefing[];
}

export async function getBriefingByDate(date: string): Promise<Briefing | null> {
  noStore();
  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase
    .from("briefings")
    .select(BRIEFING_COLUMNS)
    .eq("briefing_date", date)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return (data as unknown as Briefing) ?? null;
}

export async function getBriefingDates(): Promise<string[]> {
  noStore();
  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase
    .from("briefings")
    .select("briefing_date")
    .order("briefing_date", { ascending: false })
    .limit(365);

  if (error) throw new Error(error.message);
  return (data ?? []).map((row) => row.briefing_date as string);
}
