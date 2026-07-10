import Link from "next/link";

import { BriefingCalendarNav } from "@/components/briefing/briefing-calendar-nav";
import { ModeToggle } from "@/components/common/mode-toggle";
import { Button } from "@/components/ui/button";

export function SiteHeader({ dates }: { dates: string[] }) {
  return (
    <header className="mb-8 flex items-center justify-between gap-3">
      <Link href="/">
        <h1 className="font-brand text-xl font-bold tracking-tight sm:text-2xl">
          Daily AI Briefing
        </h1>
      </Link>
      <div className="flex items-center gap-1">
        <BriefingCalendarNav dates={dates} />
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
