"use client"

import * as React from "react"
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react"
import { DayPicker } from "react-day-picker"

import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"

export type CalendarProps = React.ComponentProps<typeof DayPicker>

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-4", className)}
      classNames={{
        months: "flex flex-col sm:flex-row gap-4",
        month: "flex flex-col gap-4",
        month_caption: "flex justify-center pt-1 relative items-center h-10",
        caption_label: "text-sm font-medium text-foreground",
        nav: "flex items-center gap-1",
        button_previous: cn(
          buttonVariants({ variant: "ghost", size: "icon-sm" }),
          "absolute left-1 top-1 rounded-sm"
        ),
        button_next: cn(
          buttonVariants({ variant: "ghost", size: "icon-sm" }),
          "absolute right-1 top-1 rounded-sm"
        ),
        month_grid: "w-full border-collapse",
        weekdays: "flex",
        weekday: "text-muted-foreground w-9 font-medium text-xs text-center",
        week: "flex w-full mt-1",
        day: "p-0.5 text-center",
        day_button: cn(
          // Base
          "inline-flex items-center justify-center h-9 w-9 rounded-sm text-sm font-normal",
          "transition-colors cursor-pointer",
          // Hover - uses secondary (Day cream) per DS
          "hover:bg-secondary hover:text-secondary-foreground",
          // Focus - uses ring (orange) per DS
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          // Selected state - primary green
          "aria-selected:bg-primary aria-selected:text-primary-foreground aria-selected:hover:opacity-90"
        ),
        range_start: "rounded-l-sm",
        range_end: "rounded-r-sm",
        range_middle: "bg-primary/20 text-foreground rounded-none",
        selected: "",
        // Today - only show ring/border, not background (so selected can override)
        today: "[&>button]:ring-1 [&>button]:ring-primary",
        outside: "text-muted-foreground/40",
        disabled: "text-muted-foreground/30 pointer-events-none",
        hidden: "invisible",
        ...classNames,
      }}
      components={{
        Chevron: ({ orientation }) => {
          const Icon = orientation === "left" ? ChevronLeftIcon : ChevronRightIcon
          return <Icon className="size-4" />
        },
      }}
      {...props}
    />
  )
}

Calendar.displayName = "Calendar"

export { Calendar }
