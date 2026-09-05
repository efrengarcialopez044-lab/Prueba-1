import { NextResponse } from "next/server";
import {
  BookingError,
  deleteBooking,
  getBookingById,
  getProperty,
  updateBookingStatus,
} from "@/lib/db";
import { updateBookingStatusSchema } from "@/lib/validations";
import { getIsAdmin } from "@/lib/auth";
import { sendBookingCancelledEmail, sendBookingConfirmedEmail } from "@/lib/email";

export const dynamic = "force-dynamic";

interface Params {
  params: Promise<{ id: string }>;
}

/**
 * PATCH /api/bookings/:id — updates a booking's status.
 * Guests may only cancel their own booking (identified by booking code,
 * enforced by the caller passing the id they were shown) and only while
 * within the cancellation window; the deadline check happens in lib/db.ts
 * regardless of what the client sends. Admins can set any status.
 */
export async function PATCH(request: Request, { params }: Params) {
  const { id } = await params;
  const isAdmin = await getIsAdmin();

  const json = await request.json().catch(() => null);
  const parsed = updateBookingStatusSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Estado inválido" }, { status: 400 });
  }

  // Only admins may (re)confirm a booking; guests may only cancel.
  if (!isAdmin && parsed.data.status !== "cancelled") {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    const booking = await updateBookingStatus(id, parsed.data.status, { isAdmin });

    const property = await getProperty();
    if (booking.status === "confirmed") {
      sendBookingConfirmedEmail(booking, property).catch((err) =>
        console.error("Error enviando email de confirmación", err)
      );
    } else if (booking.status === "cancelled") {
      sendBookingCancelledEmail(booking, property).catch((err) =>
        console.error("Error enviando email de cancelación", err)
      );
    }

    return NextResponse.json({ booking });
  } catch (error) {
    if (error instanceof BookingError) {
      return NextResponse.json({ error: error.message }, { status: 409 });
    }
    return NextResponse.json({ error: "No se pudo actualizar la reserva" }, { status: 500 });
  }
}

export async function GET(_request: Request, { params }: Params) {
  const { id } = await params;
  const booking = await getBookingById(id);
  if (!booking) {
    return NextResponse.json({ error: "Reserva no encontrada" }, { status: 404 });
  }
  return NextResponse.json({ booking });
}

/** DELETE /api/bookings/:id — admin only. */
export async function DELETE(_request: Request, { params }: Params) {
  if (!(await getIsAdmin())) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  const { id } = await params;
  await deleteBooking(id);
  return NextResponse.json({ success: true });
}
