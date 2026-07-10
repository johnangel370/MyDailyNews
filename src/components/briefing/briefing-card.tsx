"use client";

import Link from "next/link";
import { motion } from "motion/react";

import { EmptyState } from "@/components/common/empty-state";
import { MarkdownContent } from "@/components/common/markdown-content";
import { SourcesBlock } from "@/components/briefing/sources-block";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { sectionText, type SectionKey } from "@/lib/briefing-utils";
import { fadeInUp } from "@/lib/motion";
import type { Briefing } from "@/lib/types";
import { cn } from "@/lib/utils";

export function BriefingCard({
  briefing,
  section,
  highlight,
}: {
  briefing: Briefing;
  section: SectionKey;
  highlight?: boolean;
}) {
  const text = sectionText(briefing, section);
  return (
    <motion.div variants={fadeInUp}>
      <Card className={cn(highlight && "border-primary/50")}>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">
            <Link
              href={`/briefing/${briefing.briefing_date}`}
              className="font-mono text-muted-foreground transition-colors hover:text-primary"
            >
              {briefing.briefing_date}
            </Link>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {text ? (
            <MarkdownContent>{text}</MarkdownContent>
          ) : (
            <EmptyState>(no content for this section)</EmptyState>
          )}
          {briefing.sources && <SourcesBlock sources={briefing.sources} />}
        </CardContent>
      </Card>
    </motion.div>
  );
}
