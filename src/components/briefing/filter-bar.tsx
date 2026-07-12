"use client";

import { Search } from "lucide-react";

import { useFilter } from "@/components/briefing/filter-context";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SECTIONS, type SectionKey } from "@/lib/briefing-utils";

// Persistent search + section filter. Reads/writes the shared FilterContext
// so its state survives navigation between dates (the enclosing (app) layout
// is not remounted).
export function FilterBar() {
  const { query, setQuery, section, setSection } = useFilter();

  return (
    <div className="mb-8 flex flex-wrap gap-2">
      <div className="relative min-w-[220px] flex-1">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search briefings..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-9"
        />
      </div>
      <Select value={section} onValueChange={(v) => setSection(v as SectionKey)}>
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
