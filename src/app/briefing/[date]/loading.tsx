import { PageShell } from "@/components/common/page-shell";
import { Skeleton } from "@/components/ui/skeleton";

// Shown automatically while /briefing/[date] fetches its data on the
// server, so calendar navigation has an immediate loading animation.
export default function BriefingDetailLoading() {
  return (
    <PageShell>
      <div className="mb-8 flex items-center justify-between gap-3">
        <Skeleton className="h-8 w-56" />
        <div className="flex gap-2">
          <Skeleton className="h-9 w-9 rounded-md" />
          <Skeleton className="h-9 w-9 rounded-md" />
          <Skeleton className="h-9 w-16 rounded-md" />
        </div>
      </div>

      <Skeleton className="mb-6 h-8 w-32" />
      <Skeleton className="mb-8 h-10 w-48" />

      <div className="flex flex-col gap-8">
        {[0, 1, 2].map((i) => (
          <div key={i}>
            <Skeleton className="mb-3 h-6 w-40" />
            <Skeleton className="h-40 w-full rounded-2xl" />
          </div>
        ))}
      </div>
    </PageShell>
  );
}
