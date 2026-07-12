import { ContentSwitcher } from "@/components/briefing/content-switcher";
import { FilterBar } from "@/components/briefing/filter-bar";
import { FilterProvider } from "@/components/briefing/filter-context";
import { PageShell } from "@/components/common/page-shell";
import { SiteHeader } from "@/components/layout/site-header";
import { getAllBriefings } from "@/lib/briefings";
import type { Briefing } from "@/lib/types";

export const dynamic = "force-dynamic";

// Shared chrome for every authenticated page (/ and /briefing/[date]). The
// header, calendar and filter bar live here so they are NOT remounted when
// navigating between dates — only the page content below re-renders. The full
// briefing list is loaded once and handed to the client via FilterProvider,
// which powers both cross-date search and the single-date view (see
// BriefingView). Login stays outside this route group, so it has no chrome.
export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let briefings: Briefing[] = [];
  let errorMsg = "";
  try {
    briefings = await getAllBriefings();
  } catch (err) {
    errorMsg = err instanceof Error ? err.message : String(err);
  }

  return (
    <PageShell>
      <FilterProvider briefings={briefings} errorMsg={errorMsg}>
        <SiteHeader dates={briefings.map((b) => b.briefing_date)} />
        <FilterBar />
        <ContentSwitcher>{children}</ContentSwitcher>
      </FilterProvider>
    </PageShell>
  );
}
