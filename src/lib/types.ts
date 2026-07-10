export interface Briefing {
  id: number;
  briefing_date: string;
  cv_section: string | null;
  llm_section: string | null;
  multimodal_section: string | null;
  sources: string | null;
  raw_markdown: string | null;
  created_at: string;
}
