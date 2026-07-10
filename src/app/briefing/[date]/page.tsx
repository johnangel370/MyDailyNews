import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { format, isValid, parse } from "date-fns";
import { ArrowLeft } from "lucide-react";

import { SourcesBlock } from "@/components/briefing/sources-block";
import { MarkdownContent } from "@/components/common/markdown-content";
import { PageShell } from "@/components/common/page-shell";
import { SectionHeading } from "@/components/common/section-heading";
import { SiteHeader } from "@/components/layout/site-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getBriefingByDate, getBriefingDates } from "@/lib/briefings";

export const dynamic = "force-dynamic";

// True only for a real calendar date in canonical yyyy-MM-dd form, so
// invalid values 404 instead of reaching Postgres (which would error on
// e.g. month 99).
function isValidDateParam(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const parsed = parse(value, "yyyy-MM-dd", new Date());
  return isValid(parsed) && format(parsed, "yyyy-MM-dd") === value;
}

type Params = { params: { date: string } };

export function generateMetadata({ params }: Params): Metadata {
  return { title: `Briefing — ${params.date}` };
}

export default async function BriefingDetailPage({ params }: Params) {
  if (!isValidDateParam(params.date)) notFound();

  const [briefing, dates] = await Promise.all([
    getBriefingByDate(params.date),
    getBriefingDates(),
  ]);
  if (!briefing) notFound();

  const sections = [
    { label: "Computer Vision", text: briefing.cv_section },
    { label: "LLM", text: briefing.llm_section },
    { label: "Multimodal", text: briefing.multimodal_section },
  ].filter((s): s is { label: string; text: string } => Boolean(s.text));

  return (
    <PageShell>
      <SiteHeader dates={dates} />

      <Button asChild variant="ghost" size="sm" className="mb-6 -ml-2 text-muted-foreground">
        <Link href="/">
          <ArrowLeft className="mr-1 h-4 w-4" />
          All briefings
        </Link>
      </Button>

      <h2 className="mb-8 font-mono text-2xl font-semibold tracking-tight">
        {briefing.briefing_date}
      </h2>

      <div className="flex flex-col gap-8">
        {sections.map((s) => (
          <section key={s.label}>
            <SectionHeading accent>{s.label}</SectionHeading>
            <Card>
              <CardContent className="pt-6">
                <MarkdownContent>{s.text}</MarkdownContent>
              </CardContent>
            </Card>
          </section>
        ))}
      </div>

      {briefing.sources && (
        <div className="mt-8">
          <SourcesBlock sources={briefing.sources} />
        </div>
      )}
    </PageShell>
  );
}
