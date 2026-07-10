"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "motion/react";

import { BriefingCard } from "@/components/briefing/briefing-card";
import { BriefingFilters } from "@/components/briefing/briefing-filters";
import { EmptyState } from "@/components/common/empty-state";
import { SectionHeading } from "@/components/common/section-heading";
import { staggerContainer } from "@/lib/motion";
import type { SectionKey } from "@/lib/briefing-utils";
import type { Briefing } from "@/lib/types";
import { useBriefingFilter } from "@/hooks/use-briefing-filter";

export function BriefingExplorer({ briefings }: { briefings: Briefing[] }) {
  const [query, setQuery] = useState("");
  const [section, setSection] = useState<SectionKey>("all");
  const reduceMotion = useReducedMotion();

  const filtered = useBriefingFilter(briefings, query, section);
  const latest = filtered[0];
  const history = filtered.slice(1);

  return (
    <div>
      <BriefingFilters
        query={query}
        onQueryChange={setQuery}
        section={section}
        onSectionChange={setSection}
      />

      {filtered.length === 0 && (
        <EmptyState>No briefings match your search yet.</EmptyState>
      )}

      <motion.div
        initial={reduceMotion ? false : "hidden"}
        animate="visible"
        variants={staggerContainer}
      >
        {latest && (
          <section className="mb-10">
            <SectionHeading accent>Latest -- {latest.briefing_date}</SectionHeading>
            <BriefingCard briefing={latest} section={section} highlight />
          </section>
        )}

        {history.length > 0 && (
          <section>
            <SectionHeading>History</SectionHeading>
            <div className="flex flex-col gap-4">
              {history.map((b) => (
                <BriefingCard key={b.id} briefing={b} section={section} />
              ))}
            </div>
          </section>
        )}
      </motion.div>
    </div>
  );
}
