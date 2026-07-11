"use client";

import { useMemo, useState } from "react";
import { format, parse } from "date-fns";
import { CalendarDays, Loader2 } from "lucide-react";

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
  const [open, setOpen] = useState(false);
  const [navigating, setNavigating] = useState(false);

  const dateSet = useMemo(() => new Set(dates), [dates]);
  const defaultMonth = useMemo(
    () => (dates.length ? parse(dates[0], "yyyy-MM-dd", new Date()) : new Date()),
    [dates]
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Browse briefings by date">
          {navigating ? (
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
          // Full-page navigation (not client-side router.push) so the target
          // date's page is always freshly server-rendered. This sidesteps the
          // App Router client Router Cache, which could otherwise show a
          // previously-viewed date's content on the new URL.
          onDayClick={(day, modifiers) => {
            if (modifiers.disabled) return;
            setOpen(false);
            setNavigating(true);
            window.location.assign(`/briefing/${format(day, "yyyy-MM-dd")}`);
          }}
        />
      </PopoverContent>
    </Popover>
  );
}
