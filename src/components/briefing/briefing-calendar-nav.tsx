"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { format, parse } from "date-fns";
import { CalendarDays, Loader2 } from "lucide-react";

import { useFilter } from "@/components/briefing/filter-context";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

// Date strings are always handled with date-fns parse/format in local time.
// `new Date("yyyy-MM-dd")` would parse as UTC and shift a day in
// negative-offset timezones.
export function BriefingCalendarNav({ dates }: { dates: string[] }) {
  const router = useRouter();
  const { setSection, setQuery } = useFilter();
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const dateSet = useMemo(() => new Set(dates), [dates]);
  const defaultMonth = useMemo(
    () => (dates.length ? parse(dates[0], "yyyy-MM-dd", new Date()) : new Date()),
    [dates]
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Browse briefings by date">
          {isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <CalendarDays className="h-4 w-4" />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="end">
        <Calendar
          defaultMonth={defaultMonth}
          disabled={(day) => !dateSet.has(format(day, "yyyy-MM-dd"))}
          // Client-side navigation keeps the SPA feel and shows the route's
          // loading skeleton. Fresh content is guaranteed by the server side
          // (force-dynamic + noStore reads); no client cache staleness.
          onDayClick={(day, modifiers) => {
            if (modifiers.disabled) return;
            setOpen(false);
            // Picking a date means "show that full day": leave the archive /
            // search overlay modes so ContentSwitcher falls through to the
            // day view.
            setSection("all");
            setQuery("");
            startTransition(() => {
              router.push(`/briefing/${format(day, "yyyy-MM-dd")}`);
            });
          }}
        />
      </PopoverContent>
    </Popover>
  );
}
