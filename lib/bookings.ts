import type { BlockedDate, Booking, PriceBreakdown, Property } from "./types";

/**
 * All date-range logic below treats check_in as inclusive and check_out as
 * exclusive (the standard "hotel" convention): a stay from the 10th to the
 * 13th occupies nights 10, 11 and 12. Two ranges [a, b) and [c, d) overlap
 * iff a < d && c < b.
 */

export function rangesOverlap(
  aStart: string,
  aEnd: string,
  bStart: string,
  bEnd: string
): boolean {
  return aStart < bEnd && bStart < aEnd;
}

export function nightsBetween(checkIn: string, checkOut: string): number {
  const inDate = new Date(checkIn + "T00:00:00Z");
  const outDate = new Date(checkOut + "T00:00:00Z");
  const ms = outDate.getTime() - inDate.getTime();
  return Math.round(ms / (1000 * 60 * 60 * 24));
}

export function calculatePrice(
  checkIn: string,
  checkOut: string,
  property: Pick<Property, "price_per_night" | "cleaning_fee">
): PriceBreakdown {
  const nights = nightsBetween(checkIn, checkOut);
  const subtotal = Math.max(nights, 0) * property.price_per_night;
  const total = subtotal + (nights > 0 ? property.cleaning_fee : 0);

  return {
    nights,
    pricePerNight: property.price_per_night,
    subtotal,
    cleaningFee: nights > 0 ? property.cleaning_fee : 0,
    total,
  };
}

export interface DateRangeValidationInput {
  checkIn: string;
  checkOut: string;
  guests: number;
  maxGuests: number;
  existingBookings: Pick<Booking, "check_in" | "check_out" | "status">[];
  blockedDates: Pick<BlockedDate, "start_date" | "end_date">[];
  minNights?: number;
}

export interface DateRangeValidationResult {
  valid: boolean;
  error?: string;
}

/**
 * Single source of truth for "can this stay be booked". Used both by the
 * public booking API (untrusted input) and the admin manual-booking form,
 * so availability can never be bypassed from the client.
 */
export function validateBookingRange({
  checkIn,
  checkOut,
  guests,
  maxGuests,
  existingBookings,
  blockedDates,
  minNights = 1,
}: DateRangeValidationInput): DateRangeValidationResult {
  if (!checkIn || !checkOut) {
    return { valid: false, error: "Selecciona fecha de entrada y salida." };
  }

  if (checkOut <= checkIn) {
    return { valid: false, error: "La fecha de salida debe ser posterior a la de entrada." };
  }

  const today = new Date().toISOString().slice(0, 10);
  if (checkIn < today) {
    return { valid: false, error: "No se pueden reservar fechas pasadas." };
  }

  const nights = nightsBetween(checkIn, checkOut);
  if (nights < minNights) {
    return {
      valid: false,
      error: `La estancia mínima es de ${minNights} noche${minNights > 1 ? "s" : ""}.`,
    };
  }

  if (guests < 1) {
    return { valid: false, error: "El número de huéspedes debe ser al menos 1." };
  }

  if (guests > maxGuests) {
    return {
      valid: false,
      error: `La casa admite un máximo de ${maxGuests} huéspedes.`,
    };
  }

  const blockingBookings = existingBookings.filter((b) => b.status !== "cancelled");

  for (const booking of blockingBookings) {
    if (rangesOverlap(checkIn, checkOut, booking.check_in, booking.check_out)) {
      return { valid: false, error: "Las fechas seleccionadas ya no están disponibles." };
    }
  }

  for (const blocked of blockedDates) {
    if (rangesOverlap(checkIn, checkOut, blocked.start_date, blocked.end_date)) {
      return { valid: false, error: "Las fechas seleccionadas no están disponibles." };
    }
  }

  return { valid: true };
}

export type DayAvailability = "available" | "booked" | "blocked" | "past";

/**
 * Expands bookings + blocked dates into a day-by-day availability map for
 * calendar rendering, covering [rangeStart, rangeEnd).
 */
export function buildAvailabilityMap(
  rangeStart: string,
  rangeEnd: string,
  bookings: Pick<Booking, "check_in" | "check_out" | "status">[],
  blockedDates: Pick<BlockedDate, "start_date" | "end_date">[]
): Record<string, DayAvailability> {
  const map: Record<string, DayAvailability> = {};
  const today = new Date().toISOString().slice(0, 10);

  const cursor = new Date(rangeStart + "T00:00:00Z");
  const end = new Date(rangeEnd + "T00:00:00Z");

  const activeBookings = bookings.filter((b) => b.status !== "cancelled");

  while (cursor < end) {
    const iso = cursor.toISOString().slice(0, 10);
    const nextIso = new Date(cursor.getTime() + 86400000).toISOString().slice(0, 10);

    let status: DayAvailability = "available";

    if (iso < today) {
      status = "past";
    } else if (activeBookings.some((b) => rangesOverlap(iso, nextIso, b.check_in, b.check_out))) {
      status = "booked";
    } else if (
      blockedDates.some((b) => rangesOverlap(iso, nextIso, b.start_date, b.end_date))
    ) {
      status = "blocked";
    }

    map[iso] = status;
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }

  return map;
}

/**
 * Cancellation policy: a guest may cancel only while there are still at
 * least `deadlineDays` full days before check-in. Evaluated server-side on
 * every cancellation request — never trust a client-side button state.
 */
export function daysUntilCheckIn(checkIn: string, now: Date = new Date()): number {
  const todayIso = now.toISOString().slice(0, 10);
  return nightsBetween(todayIso, checkIn);
}

export function canGuestCancel(checkIn: string, deadlineDays: number, now: Date = new Date()): boolean {
  return daysUntilCheckIn(checkIn, now) >= deadlineDays;
}

export function generateBookingCode(): string {
  const random = Math.floor(10000 + Math.random() * 90000);
  return `CE-${random}`;
}
