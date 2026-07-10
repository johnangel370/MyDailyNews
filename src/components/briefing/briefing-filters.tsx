"use client";

import { Search } from "lucide-react";

import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SECTIONS, type SectionKey } from "@/lib/briefing-utils";

export function BriefingFilters({
  query,
  onQueryChange,
  section,
  onSectionChange,
}: {
  query: string;
  onQueryChange: (query: string) => void;
  section: SectionKey;
  onSectionChange: (section: SectionKey) => void;
}) {
  return (
    <div className="mb-8 flex flex-wrap gap-2">
      <div className="relative min-w-[220px] flex-1">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search briefings..."
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          className="pl-9"
        />
      </div>
      <Select value={section} onValueChange={(v) => onSectionChange(v as SectionKey)}>
        <SelectTrigger className="w-[180px]" aria-label="Filter by section">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {SECTIONS.map((s) => (
            <SelectItem key={s.key} value={s.key}>
              {s.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
