import "server-only";
import { JWT } from "google-auth-library";
import type { Booking, Property } from "./types";

/**
 * Syncs confirmed bookings to the owner's Google Calendar using a service
 * account — no OAuth consent screen, no user sign-in flow. The owner just
 * shares their calendar with the service account's email (Settings and
 * sharing → Share with specific people → "Make changes to events") and
 * sets the three env vars below. Without them, calls no-op and log to the
 * console, same pattern as lib/email.ts and lib/stripe.ts.
 */

const CALENDAR_ID = process.env.GOOGLE_CALENDAR_ID;
const SERVICE_ACCOUNT_EMAIL = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
// Google prints the private key with literal "\n" sequences when exported
// as an env var; convert them back to real newlines.
const PRIVATE_KEY = process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY?.replace(/\\n/g, "\n");

export const isGoogleCalendarConfigured = Boolean(
  CALENDAR_ID && SERVICE_ACCOUNT_EMAIL && PRIVATE_KEY
);

function getClient(): JWT {
  return new JWT({
    email: SERVICE_ACCOUNT_EMAIL,
    key: PRIVATE_KEY,
    scopes: ["https://www.googleapis.com/auth/calendar.events"],
  });
}

async function calendarFetch(path: string, init?: RequestInit) {
  const client = getClient();
  const { token } = await client.getAccessToken();

  const res = await fetch(
    `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(CALENDAR_ID!)}${path}`,
    {
      ...init,
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        ...init?.headers,
      },
    }
  );

  if (!res.ok) {
    throw new Error(`Google Calendar API error (${res.status}): ${await res.text()}`);
  }
  return res.status === 204 ? null : res.json();
}

function eventPayload(booking: Booking, property: Property) {
  const description = [
    `Código de reserva: ${booking.booking_code}`,
    `Email: ${booking.guest_email}`,
    `Teléfono: ${booking.guest_phone}`,
    `Huéspedes: ${booking.guests}`,
    booking.notes ? `Notas: ${booking.notes}` : null,
  ]
    .filter(Boolean)
    .join("\n");

  return {
    summary: `Reserva: ${booking.guest_name} ${booking.guest_last_name}`,
    description,
    location: `${property.address}, ${property.city}`,
    // Google's all-day events use exclusive end dates, same convention we
    // already use for check_out — no off-by-one conversion needed.
    start: { date: booking.check_in },
    end: { date: booking.check_out },
  };
}

/** Creates a calendar event for a confirmed booking. Returns its event id, or null in demo mode. */
export async function createBookingCalendarEvent(
  booking: Booking,
  property: Property
): Promise<string | null> {
  if (!isGoogleCalendarConfigured) {
    console.log(`[google-calendar:mock] Crearía evento para la reserva ${booking.booking_code}`);
    return null;
  }

  const event = await calendarFetch("/events", {
    method: "POST",
    body: JSON.stringify(eventPayload(booking, property)),
  });
  return event.id as string;
}

/** Removes a booking's calendar event, e.g. after a cancellation. */
export async function deleteBookingCalendarEvent(eventId: string): Promise<void> {
  if (!isGoogleCalendarConfigured) return;
  try {
    await calendarFetch(`/events/${encodeURIComponent(eventId)}`, { method: "DELETE" });
  } catch (error) {
    console.error("No se pudo eliminar el evento de Google Calendar", error);
  }
}
