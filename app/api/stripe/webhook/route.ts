import { NextResponse } from "next/server";
import { confirmBookingPayment, getBookingById, getProperty, releaseUnpaidBooking } from "@/lib/db";
import { constructWebhookEvent } from "@/lib/stripe";
import { sendBookingConfirmedEmail } from "@/lib/email";
import type Stripe from "stripe";

export const dynamic = "force-dynamic";

/**
 * Stripe webhook: source of truth for turning a "pending" (awaiting
 * payment) booking into "confirmed". Register this endpoint's URL in the
 * Stripe Dashboard (Developers → Webhooks) listening for
 * checkout.session.completed and checkout.session.expired, and put the
 * signing secret it gives you into STRIPE_WEBHOOK_SECRET.
 */
export async function POST(request: Request) {
  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "Falta la firma de Stripe" }, { status: 400 });
  }

  const rawBody = await request.text();

  let event: Stripe.Event;
  try {
    event = constructWebhookEvent(rawBody, signature);
  } catch (error) {
    console.error("Firma de webhook de Stripe inválida", error);
    return NextResponse.json({ error: "Firma inválida" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const bookingId = session.metadata?.bookingId;
        if (!bookingId) break;

        const paymentIntentId =
          typeof session.payment_intent === "string" ? session.payment_intent : null;

        const wasAlreadyPaid = (await getBookingById(bookingId))?.paid_at != null;
        const booking = await confirmBookingPayment(bookingId, session.id, paymentIntentId);

        if (!wasAlreadyPaid) {
          const property = await getProperty();
          sendBookingConfirmedEmail(booking, property).catch((err) =>
            console.error("Error enviando email de confirmación", err)
          );
        }
        break;
      }

      case "checkout.session.expired": {
        const session = event.data.object as Stripe.Checkout.Session;
        const bookingId = session.metadata?.bookingId;
        if (bookingId) await releaseUnpaidBooking(bookingId);
        break;
      }

      default:
        break;
    }
  } catch (error) {
    console.error("Error procesando el webhook de Stripe", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
