import { Skeleton } from "@/components/ui/skeleton";

// Content-only skeleton for the page segment. The header and filter bar are
// rendered by the persistent (app) layout and stay put, so this covers just
// the briefing body below them.
export default function BriefingDetailLoading() {
  return (
    <div>
      <Skeleton className="mb-8 h-10 w-48" />
      <div className="flex flex-col gap-6">
        {[0, 1, 2].map((i) => (
          <div key={i}>
            <Skeleton className="mb-3 h-6 w-40" />
            <Skeleton className="h-40 w-full rounded-2xl" />
          </div>
        ))}
      </div>
    </div>
  );
}
