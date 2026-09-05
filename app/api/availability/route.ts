import { NextResponse } from "next/server";
import { getBlockedDates, getBookings } from "@/lib/db";
import { buildAvailabilityMap } from "@/lib/bookings";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

const AVAILABILITY_LIMIT = 60;
const AVAILABILITY_WINDOW_MS = 60 * 1000;

/**
 * GET /api/availability?from=YYYY-MM-DD&to=YYYY-MM-DD
 * Returns a day-by-day availability map for calendar rendering. Only
 * exposes availability status, never guest data.
 */
export async function GET(request: Request) {
  const { allowed, retryAfterSeconds } = checkRateLimit(
    `availability:${getClientIp(request)}`,
    AVAILABILITY_LIMIT,
    AVAILABILITY_WINDOW_MS
  );
  if (!allowed) {
    return NextResponse.json(
      { error: "Demasiadas solicitudes. Inténtalo de nuevo en unos segundos." },
      { status: 429, headers: { "Retry-After": String(retryAfterSeconds) } }
    );
  }

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
