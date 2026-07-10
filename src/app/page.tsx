import { BriefingExplorer } from "@/components/briefing/briefing-explorer";
import { EmptyState } from "@/components/common/empty-state";
import { PageShell } from "@/components/common/page-shell";
import { SiteHeader } from "@/components/layout/site-header";
import { getAllBriefings } from "@/lib/briefings";
import type { Briefing } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  let briefings: Briefing[] = [];
  let errorMsg = "";
  try {
    briefings = await getAllBriefings();
  } catch (err) {
    errorMsg = err instanceof Error ? err.message : String(err);
  }

  return (
    <PageShell>
      <SiteHeader dates={briefings.map((b) => b.briefing_date)} />
      {errorMsg ? (
        <EmptyState>Could not load briefings: {errorMsg}</EmptyState>
      ) : (
        <BriefingExplorer briefings={briefings} />
      )}
    </PageShell>
  );
}
