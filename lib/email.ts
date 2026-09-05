import "server-only";
import type { Booking, Property } from "./types";

/**
 * Email sending is stubbed out: it logs what would be sent so the booking
 * flow is fully wired end-to-end. Wire up a real provider by setting
 * RESEND_API_KEY and swapping the body of `send()` for the provider's
 * SDK call — every call site below already passes the right data.
 */
async function send(to: string, subject: string, html: string) {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    console.log(`[email:mock] Para: ${to} | Asunto: ${subject}`);
    return;
  }

  await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: process.env.EMAIL_FROM ?? "reservas@example.com",
      to,
      subject,
      html,
    }),
  });
}

export async function sendBookingRequestEmails(booking: Booking, property: Property) {
  await Promise.all([
    send(
      booking.guest_email,
      `Hemos recibido tu solicitud de reserva — ${property.name}`,
      `<p>Hola ${booking.guest_name},</p>
       <p>Hemos recibido tu solicitud de reserva (código <strong>${booking.booking_code}</strong>)
       del ${booking.check_in} al ${booking.check_out} para ${booking.guests} huéspedes.</p>
       <p>Te confirmaremos la disponibilidad en breve.</p>`
    ),
    send(
      property.contact_email,
      `Nueva solicitud de reserva — ${booking.booking_code}`,
      `<p>Nueva solicitud de ${booking.guest_name} ${booking.guest_last_name} (${booking.guest_email}, ${booking.guest_phone})
       para ${booking.check_in} → ${booking.check_out}, ${booking.guests} huéspedes.</p>
       <p>Total estimado: ${booking.total_price} €</p>`
    ),
  ]);
}

export async function sendBookingConfirmedEmail(booking: Booking, property: Property) {
  await send(
    booking.guest_email,
    `Reserva confirmada — ${property.name}`,
    `<p>Hola ${booking.guest_name},</p>
     <p>Tu reserva <strong>${booking.booking_code}</strong> ha sido confirmada para el
     ${booking.check_in} → ${booking.check_out}. ¡Te esperamos!</p>`
  );
}

export async function sendBookingCancelledEmail(booking: Booking, property: Property) {
  await send(
    booking.guest_email,
    `Reserva cancelada — ${property.name}`,
    `<p>Hola ${booking.guest_name},</p>
     <p>Tu reserva <strong>${booking.booking_code}</strong> ha sido cancelada.</p>`
  );
}
