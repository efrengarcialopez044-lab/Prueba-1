import { NextResponse } from "next/server";
import {
  attachCheckoutSession,
  BookingError,
  createBooking,
  getBookings,
  getProperty,
} from "@/lib/db";
import { createBookingSchema, manualBookingSchema } from "@/lib/validations";
import { getIsAdmin } from "@/lib/auth";
import { sendBookingRequestEmails } from "@/lib/email";
import { createCheckoutSession, isStripeConfigured } from "@/lib/stripe";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

const BOOKING_CREATE_LIMIT = 5;
const BOOKING_CREATE_WINDOW_MS = 15 * 60 * 1000;

export const dynamic = "force-dynamic";

/** GET /api/bookings — admin only, lists every booking. */
export async function GET() {
  if (!(await getIsAdmin())) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  const bookings = await getBookings();
  return NextResponse.json({ bookings });
}

/**
 * POST /api/bookings — public endpoint that creates a booking request.
 * Every field is re-validated here: the client-side calendar and price
 * shown to the guest are only a preview, this is the source of truth.
 *
 * When Stripe is configured, this is an instant-booking flow: the guest is
 * sent to Stripe Checkout to pay, and the booking only becomes "confirmed"
 * once payment succeeds (see app/api/stripe/webhook/route.ts). Until then
 * it sits as "pending", which still holds the dates.
 */
export async function POST(request: Request) {
  const isAdmin = await getIsAdmin();

  if (!isAdmin) {
    const { allowed, retryAfterSeconds } = checkRateLimit(
      `booking-create:${getClientIp(request)}`,
      BOOKING_CREATE_LIMIT,
      BOOKING_CREATE_WINDOW_MS
    );
    if (!allowed) {
      return NextResponse.json(
        { error: "Demasiadas solicitudes. Inténtalo de nuevo en unos minutos." },
        { status: 429, headers: { "Retry-After": String(retryAfterSeconds) } }
      );
    }
  }

  const json = await request.json().catch(() => null);
  if (!json) {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  // Admins creating a manual booking from the calendar skip the
  // terms-acceptance requirement but everything else is identical.
  const schema = isAdmin && json.manual ? manualBookingSchema : createBookingSchema;
  const parsed = schema.safeParse(json);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Datos inválidos" },
      { status: 400 }
    );
  }

  try {
    const status = isAdmin && "status" in parsed.data ? parsed.data.status : undefined;
    const booking = await createBooking(parsed.data, { status });

    if (isAdmin) {
      return NextResponse.json({ booking }, { status: 201 });
    }

    if (isStripeConfigured) {
      const origin = new URL(request.url).origin;
      const session = await createCheckoutSession({
        bookingId: booking.id,
        bookingCode: booking.booking_code,
        amount: booking.total_price,
        customerEmail: booking.guest_email,
        successUrl: `${origin}/reserva-confirmada/${booking.booking_code}?session_id={CHECKOUT_SESSION_ID}`,
        cancelUrl: `${origin}/reservar`,
      });
      await attachCheckoutSession(booking.id, session.id);
      return NextResponse.json({ booking, checkoutUrl: session.url }, { status: 201 });
    }

    const property = await getProperty();
    sendBookingRequestEmails(booking, property).catch((err) =>
      console.error("Error enviando emails de solicitud", err)
    );

    return NextResponse.json({ booking }, { status: 201 });
  } catch (error) {
    if (error instanceof BookingError) {
      return NextResponse.json({ error: error.message }, { status: 409 });
    }
    return NextResponse.json({ error: "No se pudo crear la reserva" }, { status: 500 });
  }
}
