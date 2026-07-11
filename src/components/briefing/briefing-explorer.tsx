"use client";

import { useState } from "react";

import { BriefingCard } from "@/components/briefing/briefing-card";
import { BriefingFilters } from "@/components/briefing/briefing-filters";
import { EmptyState } from "@/components/common/empty-state";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import type { SectionKey } from "@/lib/briefing-utils";
import type { Briefing } from "@/lib/types";
import { useBriefingFilter } from "@/hooks/use-briefing-filter";

export function BriefingExplorer({ briefings }: { briefings: Briefing[] }) {
  const [query, setQuery] = useState("");
  const [section, setSection] = useState<SectionKey>("all");

  const filtered = useBriefingFilter(briefings, query, section);
  // Latest date open by default; the rest collapsed. Multiple may be open
  // at once (type="multiple"). defaultValue is initial-mount only.
  const defaultOpen = filtered[0] ? [filtered[0].briefing_date] : [];

  return (
    <div>
      <BriefingFilters
        query={query}
        onQueryChange={setQuery}
        section={section}
        onSectionChange={setSection}
      />

      {filtered.length === 0 ? (
        <EmptyState>No briefings match your search yet.</EmptyState>
      ) : (
        <Accordion
          type="multiple"
          defaultValue={defaultOpen}
          className="flex flex-col gap-2"
        >
          {filtered.map((b) => (
            <AccordionItem
              key={b.id}
              value={b.briefing_date}
              className="border-b-0"
            >
              <AccordionTrigger className="font-mono text-base font-semibold text-topic-accent hover:no-underline">
                {b.briefing_date}
              </AccordionTrigger>
              <AccordionContent className="pt-2">
                <BriefingCard briefing={b} section={section} />
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      )}
    </div>
  );
}
