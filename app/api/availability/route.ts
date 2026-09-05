import { NextResponse } from "next/server";
import { getBlockedDates, getBookings, getProperty } from "@/lib/db";
import { buildAvailabilityMap, validateBookingRange } from "@/lib/bookings";

export const dynamic = "force-dynamic";

/**
 * GET /api/availability?from=YYYY-MM-DD&to=YYYY-MM-DD
 * Returns a day-by-day availability map for calendar rendering. Only
 * exposes availability status, never guest data.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const from = searchParams.get("from");
  const to = searchParams.get("to");

  if (!from || !to) {
    return NextResponse.json({ error: "Parámetros from y to requeridos" }, { status: 400 });
  }

  const [bookings, blockedDates] = await Promise.all([getBookings(), getBlockedDates()]);
  const map = buildAvailabilityMap(from, to, bookings, blockedDates);

  return NextResponse.json({ availability: map });
}

/**
 * POST /api/availability — checks whether a specific range/guest count is
 * bookable and returns the price breakdown. Used by the booking widget
 * before the guest fills in their details.
 */
export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  const { checkIn, checkOut, guests } = body as {
    checkIn?: string;
    checkOut?: string;
    guests?: number;
  };

  if (!checkIn || !checkOut || !guests) {
    return NextResponse.json(
      { error: "checkIn, checkOut y guests son obligatorios" },
      { status: 400 }
    );
  }

  const [property, bookings, blockedDates] = await Promise.all([
    getProperty(),
    getBookings(),
    getBlockedDates(),
  ]);

  const validation = validateBookingRange({
    checkIn,
    checkOut,
    guests: Number(guests),
    maxGuests: property.max_guests,
    existingBookings: bookings,
    blockedDates,
  });

  if (!validation.valid) {
    return NextResponse.json({ available: false, error: validation.error }, { status: 200 });
  }

  return NextResponse.json({ available: true });
}
