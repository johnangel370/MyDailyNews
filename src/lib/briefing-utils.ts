import type { Briefing } from "@/lib/types";

export type SectionKey = "all" | "cv_section" | "llm_section" | "multimodal_section";

export const SECTIONS: { key: SectionKey; label: string }[] = [
  { key: "all", label: "All sections" },
  { key: "cv_section", label: "Computer Vision" },
  { key: "llm_section", label: "LLM" },
  { key: "multimodal_section", label: "Multimodal" },
];

export function sectionText(briefing: Briefing, sectionKey: SectionKey): string {
  if (sectionKey === "all") {
    return [briefing.cv_section, briefing.llm_section, briefing.multimodal_section]
      .filter(Boolean)
      .join("\n\n");
  }
  return briefing[sectionKey] || "";
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
