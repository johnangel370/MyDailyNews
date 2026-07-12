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

export interface NewsItem {
  title: string;
  body: string;
}

// Split a section's markdown into individual news items for numbered
// rendering. Strips a leading "## Topic" heading (the topic name is shown
// outside the card), then starts a new item at each paragraph whose first
// line is entirely bold (`**...**`). If no bold-titled items are found,
// returns a single untitled item holding the whole body (older/plain rows
// still render, just without numbering).
export function parseNewsItems(sectionMarkdown: string): NewsItem[] {
  const withoutHeading = sectionMarkdown.replace(/^\s*#{1,6}\s+.*(?:\r?\n)+/, "");
  const blocks = withoutHeading.split(/\n\s*\n/);

  const items: NewsItem[] = [];
  const titleOnly = /^\*\*(.+?)\*\*\s*$/;

  for (const rawBlock of blocks) {
    const block = rawBlock.trim();
    if (!block) continue;

    const lines = block.split(/\r?\n/);
    const titleMatch = lines[0].match(titleOnly);

    if (titleMatch) {
      items.push({
        title: titleMatch[1].trim(),
        body: lines.slice(1).join("\n").trim(),
      });
    } else if (items.length > 0) {
      // Continuation of the previous item's body (e.g. a bullet list that
      // was separated from its title by a blank line).
      items[items.length - 1].body +=
        (items[items.length - 1].body ? "\n\n" : "") + block;
    } else {
      items.push({ title: "", body: block });
    }
  }

  return items.length > 0 ? items : [{ title: "", body: withoutHeading.trim() }];
}

// Keep only the news items whose title or body contains the query
// (case-insensitive). Used by search to show just the matching items.
export function filterNewsItems(items: NewsItem[], query: string): NewsItem[] {
  const q = query.trim().toLowerCase();
  if (!q) return items;
  return items.filter(
    (it) =>
      it.title.toLowerCase().includes(q) || it.body.toLowerCase().includes(q)
  );
}

// Split a per-topic sources blob (one URL per line) into a clean list.
export function parseSourceUrls(sources: string): string[] {
  return sources
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
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
