"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { format, parse } from "date-fns";
import { CalendarDays } from "lucide-react";

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
  const [open, setOpen] = useState(false);

  const dateSet = useMemo(() => new Set(dates), [dates]);
  const defaultMonth = useMemo(
    () => (dates.length ? parse(dates[0], "yyyy-MM-dd", new Date()) : new Date()),
    [dates]
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Browse briefings by date">
          <CalendarDays className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="end">
        <Calendar
          mode="single"
          defaultMonth={defaultMonth}
          disabled={(day) => !dateSet.has(format(day, "yyyy-MM-dd"))}
          onSelect={(day) => {
            if (!day) return;
            setOpen(false);
            router.push(`/briefing/${format(day, "yyyy-MM-dd")}`);
          }}
        />
      </PopoverContent>
    </Popover>
  );
}
