import "server-only";
import Stripe from "stripe";

/**
 * Stripe is wired but not activated: bookings are created as "pending"
 * requests without collecting payment. To turn on deposits/full payment:
 *   1. Set STRIPE_SECRET_KEY and STRIPE_WEBHOOK_SECRET.
 *   2. Call createCheckoutSession() after createBooking() in
 *      app/api/bookings/route.ts and redirect the guest to session.url.
 *   3. Add a webhook route (app/api/stripe/webhook/route.ts) that marks
 *      the booking "confirmed" on `checkout.session.completed`.
 */
export function getStripeClient(): Stripe | null {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) return null;
  return new Stripe(secretKey, { apiVersion: "2026-08-26.dahlia" });
}

export async function createCheckoutSession(params: {
  bookingId: string;
  bookingCode: string;
  amount: number; // in the property's currency major units, e.g. euros
  currency?: string;
  customerEmail: string;
  successUrl: string;
  cancelUrl: string;
}) {
  const stripe = getStripeClient();
  if (!stripe) {
    throw new Error("Stripe no está configurado (falta STRIPE_SECRET_KEY).");
  }

  return stripe.checkout.sessions.create({
    mode: "payment",
    customer_email: params.customerEmail,
    line_items: [
      {
        price_data: {
          currency: params.currency ?? "eur",
          unit_amount: Math.round(params.amount * 100),
          product_data: { name: `Reserva ${params.bookingCode}` },
        },
        quantity: 1,
      },
    ],
    metadata: { bookingId: params.bookingId, bookingCode: params.bookingCode },
    success_url: params.successUrl,
    cancel_url: params.cancelUrl,
  });
}
