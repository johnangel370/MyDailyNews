import Link from "next/link";

import { BriefingCalendarNav } from "@/components/briefing/briefing-calendar-nav";
import { ModeToggle } from "@/components/common/mode-toggle";
import { Button } from "@/components/ui/button";

export function SiteHeader({
  dates,
  showNav = true,
  isGuest = false,
}: {
  dates: string[];
  // Guests get no calendar (they cannot browse other dates).
  showNav?: boolean;
  isGuest?: boolean;
}) {
  return (
    <header className="mb-8 flex items-center justify-between gap-3">
      <Link href="/">
        <h1 className="font-display text-2xl font-black tracking-tight sm:text-3xl">
          Daily AI Briefing
        </h1>
      </Link>
      <div className="flex items-center gap-1">
        {isGuest && (
          <span className="mr-1 rounded-full border border-topic-accent/40 px-2 py-0.5 text-xs font-medium text-topic-accent">
            Guest
          </span>
        )}
        {showNav && <BriefingCalendarNav dates={dates} />}
        <ModeToggle />
        <form action="/api/logout" method="POST">
          <Button
            type="submit"
            variant="ghost"
            size="sm"
            className="text-muted-foreground"
          >
            Log out
          </Button>
        </form>
      </div>
    </header>
  );
}
