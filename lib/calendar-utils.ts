import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  format,
  addMonths,
} from "date-fns";
import { es } from "date-fns/locale";

export interface CalendarDay {
  iso: string;
  dayOfMonth: number;
  inMonth: boolean;
}

/** Builds a full 6-week grid (Mon–Sun) for the given month, for calendar UIs. */
export function getMonthGrid(monthDate: Date): CalendarDay[] {
  const monthStart = startOfMonth(monthDate);
  const monthEnd = endOfMonth(monthDate);
  const gridStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const gridEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });

  return eachDayOfInterval({ start: gridStart, end: gridEnd }).map((date) => ({
    iso: format(date, "yyyy-MM-dd"),
    dayOfMonth: date.getDate(),
    inMonth: date >= monthStart && date <= monthEnd,
  }));
}

export function monthLabel(monthDate: Date): string {
  const label = format(monthDate, "MMMM yyyy", { locale: es });
  return label.charAt(0).toUpperCase() + label.slice(1);
}

export { addMonths };

export const WEEKDAY_LABELS = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];
