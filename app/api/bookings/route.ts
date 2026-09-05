import { NextResponse } from "next/server";
import { BookingError, createBooking, getBookings, getProperty } from "@/lib/db";
import { createBookingSchema, manualBookingSchema } from "@/lib/validations";
import { getIsAdmin } from "@/lib/auth";
import { sendBookingRequestEmails } from "@/lib/email";

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
 */
export async function POST(request: Request) {
  const isAdmin = await getIsAdmin();
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

    if (!isAdmin) {
      const property = await getProperty();
      sendBookingRequestEmails(booking, property).catch((err) =>
        console.error("Error enviando emails de solicitud", err)
      );
    }

    return NextResponse.json({ booking }, { status: 201 });
  } catch (error) {
    if (error instanceof BookingError) {
      return NextResponse.json({ error: error.message }, { status: 409 });
    }
    return NextResponse.json({ error: "No se pudo crear la reserva" }, { status: 500 });
  }
}
