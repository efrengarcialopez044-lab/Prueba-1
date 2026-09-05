"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { getMonthGrid, monthLabel, WEEKDAY_LABELS } from "@/lib/calendar-utils";
import type { DayAvailability } from "@/lib/bookings";

export interface CalendarGridProps {
  month: Date;
  onPrevMonth?: () => void;
  onNextMonth?: () => void;
  availability: Record<string, DayAvailability>;
  selectedStart?: string | null;
  selectedEnd?: string | null;
  hoverEnd?: string | null;
  onDayClick?: (iso: string, status: DayAvailability) => void;
  disablePrev?: boolean;
  size?: "sm" | "md";
}

const statusStyles: Record<DayAvailability, string> = {
  available: "text-forest-800 hover:bg-sand-200 cursor-pointer",
  booked: "text-forest-800/30 line-through cursor-not-allowed bg-sand-100",
  blocked: "text-forest-800/30 line-through cursor-not-allowed bg-sand-100",
  past: "text-forest-800/25 cursor-not-allowed",
};

export function CalendarGrid({
  month,
  onPrevMonth,
  onNextMonth,
  availability,
  selectedStart,
  selectedEnd,
  hoverEnd,
  onDayClick,
  disablePrev,
  size = "md",
}: CalendarGridProps) {
  const days = getMonthGrid(month);
  const rangeEndPreview = selectedEnd ?? hoverEnd;

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <button
          type="button"
          onClick={onPrevMonth}
          disabled={!onPrevMonth || disablePrev}
          className="rounded-full p-1.5 text-forest-800 hover:bg-sand-200 disabled:opacity-30"
          aria-label="Mes anterior"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <p className="font-serif text-lg capitalize text-forest-800">{monthLabel(month)}</p>
        <button
          type="button"
          onClick={onNextMonth}
          disabled={!onNextMonth}
          className="rounded-full p-1.5 text-forest-800 hover:bg-sand-200 disabled:opacity-30"
          aria-label="Mes siguiente"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-y-1 text-center">
        {WEEKDAY_LABELS.map((d) => (
          <div key={d} className="text-xs font-medium text-forest-800/50">
            {d}
          </div>
        ))}

        {days.map((day) => {
          const status = availability[day.iso] ?? "available";
          const isSelectedStart = selectedStart === day.iso;
          const isSelectedEnd = selectedEnd === day.iso;
          const inRange =
            selectedStart &&
            rangeEndPreview &&
            day.iso > selectedStart &&
            day.iso < rangeEndPreview;

          return (
            <button
              type="button"
              key={day.iso}
              disabled={!day.inMonth || status !== "available" || !onDayClick}
              onClick={() => onDayClick?.(day.iso, status)}
              className={cn(
                "mx-auto flex items-center justify-center rounded-full text-sm transition-colors",
                size === "sm" ? "h-8 w-8" : "h-10 w-10",
                !day.inMonth && "invisible",
                day.inMonth && statusStyles[status],
                inRange && "rounded-none bg-terracotta-500/15",
                (isSelectedStart || isSelectedEnd) &&
                  "bg-terracotta-500! text-white! hover:bg-terracotta-500!"
              )}
            >
              {day.dayOfMonth}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function CalendarLegend() {
  const items: { label: string; className: string }[] = [
    { label: "Disponible", className: "bg-white border border-sand-300" },
    { label: "Ocupado / bloqueado", className: "bg-sand-100" },
    { label: "Seleccionado", className: "bg-terracotta-500" },
  ];

  return (
    <div className="flex flex-wrap gap-4 text-xs text-forest-800/70">
      {items.map((item) => (
        <span key={item.label} className="flex items-center gap-1.5">
          <span className={cn("h-3 w-3 rounded-full", item.className)} />
          {item.label}
        </span>
      ))}
    </div>
  );
}
