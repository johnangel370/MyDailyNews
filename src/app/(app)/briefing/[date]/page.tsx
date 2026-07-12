import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { format, isValid, parse } from "date-fns";

import { BriefingView } from "@/components/briefing/briefing-view";

// True only for a real calendar date in canonical yyyy-MM-dd form, so
// invalid values 404 instead of ever being looked up.
function isValidDateParam(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const parsed = parse(value, "yyyy-MM-dd", new Date());
  return isValid(parsed) && format(parsed, "yyyy-MM-dd") === value;
}

type Params = { params: { date: string } };

export function generateMetadata({ params }: Params): Metadata {
  return { title: `Briefing — ${params.date}` };
}

// Chrome (header, filter bar) and the briefing data live in the (app) layout.
// This page only validates the date and hands it to BriefingView, which reads
// the matching briefing from the shared FilterContext.
export default function BriefingDetailPage({ params }: Params) {
  if (!isValidDateParam(params.date)) notFound();
  return <BriefingView date={params.date} />;
}
