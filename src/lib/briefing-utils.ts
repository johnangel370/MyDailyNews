import type { Briefing } from "@/lib/types";

export type SectionKey = "all" | "cv_section" | "llm_section" | "multimodal_section";

export const SECTIONS: { key: SectionKey; label: string }[] = [
  { key: "all", label: "All sections" },
  { key: "cv_section", label: "Computer Vision" },
  { key: "llm_section", label: "LLM" },
  { key: "multimodal_section", label: "Multimodal" },
];

export interface Topic {
  key: Exclude<SectionKey, "all">;
  label: string;
  text: string | null;
  sources: string | null;
}

export interface SourceItem {
  label?: string;
  text: string;
}

function getTopics(briefing: Briefing): Topic[] {
  return [
    {
      key: "cv_section",
      label: "Computer Vision",
      text: briefing.cv_section,
      sources: briefing.cv_sources,
    },
    {
      key: "llm_section",
      label: "LLM",
      text: briefing.llm_section,
      sources: briefing.llm_sources,
    },
    {
      key: "multimodal_section",
      label: "Multimodal",
      text: briefing.multimodal_section,
      sources: briefing.multimodal_sources,
    },
  ];
}

// The topics to render as cards for the current filter: all non-empty
// topics when viewing "All sections", or just the one selected topic.
export function getVisibleTopics(briefing: Briefing, sectionKey: SectionKey): Topic[] {
  const topics = getTopics(briefing).filter((t) => t.text);
  return sectionKey === "all" ? topics : topics.filter((t) => t.key === sectionKey);
}

// Sources scoped to whatever topics are currently visible, so switching
// the section filter also switches which links show up. Falls back to the
// legacy flat `sources` column for older rows that predate the per-topic
// columns.
export function getSourceItems(briefing: Briefing, sectionKey: SectionKey): SourceItem[] {
  const visible = getVisibleTopics(briefing, sectionKey).filter((t) => t.sources);
  if (visible.length > 0) {
    return visible.map((t) => ({
      label: sectionKey === "all" ? t.label : undefined,
      text: t.sources!,
    }));
  }
  return briefing.sources ? [{ text: briefing.sources }] : [];
}

export function matchesQuery(briefing: Briefing, query: string): boolean {
  if (!query) return true;
  const haystack = [
    briefing.cv_section,
    briefing.llm_section,
    briefing.multimodal_section,
    briefing.raw_markdown,
    briefing.briefing_date,
  ]
    .filter(Boolean)
    .join("\n")
    .toLowerCase();
  return haystack.includes(query.toLowerCase());
}
