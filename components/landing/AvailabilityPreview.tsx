"use client";

import { useState } from "react";
import { addMonths } from "date-fns";
import { ButtonLink } from "@/components/ui/Button";
import { CalendarGrid, CalendarLegend } from "@/components/booking/CalendarGrid";
import type { DayAvailability } from "@/lib/bookings";

export function AvailabilityPreview({
  availability,
  monthsAvailable,
}: {
  availability: Record<string, DayAvailability>;
  monthsAvailable: number;
}) {
  const [offset, setOffset] = useState(0);
  const baseMonth = new Date();
  baseMonth.setDate(1);

  return (
    <div className="rounded-3xl border border-sand-200 bg-white p-6 sm:p-10">
      <div className="grid gap-10 md:grid-cols-[1fr_auto] md:items-start">
        <CalendarGrid
          month={addMonths(baseMonth, offset)}
          availability={availability}
          onPrevMonth={offset > 0 ? () => setOffset((o) => o - 1) : undefined}
          onNextMonth={offset < monthsAvailable - 1 ? () => setOffset((o) => o + 1) : undefined}
        />

        <div className="flex flex-col items-start gap-6 md:w-64 md:border-l md:border-sand-200 md:pl-10">
          <CalendarLegend />
          <p className="text-sm text-forest-800/70">
            Consulta el calendario y elige tus fechas exactas al reservar.
          </p>
          <ButtonLink href="/reservar" className="w-full justify-center">
            Ver fechas y reservar
          </ButtonLink>
        </div>
      </div>
    </div>
  );
}
