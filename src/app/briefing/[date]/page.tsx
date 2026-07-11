import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { format, isValid, parse } from "date-fns";
import { ArrowLeft } from "lucide-react";

import { TopicSection } from "@/components/briefing/topic-section";
import { PageShell } from "@/components/common/page-shell";
import { SiteHeader } from "@/components/layout/site-header";
import { Button } from "@/components/ui/button";
import { getBriefingByDate, getBriefingDates } from "@/lib/briefings";
import { getVisibleTopics } from "@/lib/briefing-utils";

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

  const topics = getVisibleTopics(briefing, "all");

  return (
    <PageShell>
      <SiteHeader dates={dates} />

      <Button asChild variant="ghost" size="sm" className="mb-6 -ml-2 text-muted-foreground">
        <Link href="/">
          <ArrowLeft className="mr-1 h-4 w-4" />
          All briefings
        </Link>
      </Button>

      <h2 className="mb-8 font-newspaper text-3xl font-black tracking-tight text-topic-accent">
        {briefing.briefing_date}
      </h2>

      <div className="flex flex-col gap-8">
        {topics.map((t) => (
          <TopicSection key={t.key} label={t.label} text={t.text!} sources={t.sources} />
        ))}
      </div>
    </PageShell>
  );
}
