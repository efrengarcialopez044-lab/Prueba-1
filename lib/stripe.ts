import "server-only";
import Stripe from "stripe";

/**
 * Instant-booking payments: the guest pays the full amount at checkout and
 * the booking is confirmed automatically once payment succeeds (see the
 * webhook at app/api/stripe/webhook/route.ts and confirmBookingPayment in
 * lib/db.ts). Card and PayPal both show up in Stripe's hosted Checkout
 * automatically once enabled in the Stripe Dashboard (Settings → Payment
 * methods) — no code change needed to add a payment method.
 *
 * Without STRIPE_SECRET_KEY set, isStripeConfigured is false and the
 * booking flow falls back to the original "request" flow (no payment).
 */

const SECRET_KEY = process.env.STRIPE_SECRET_KEY;
const WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET;

export const isStripeConfigured = Boolean(SECRET_KEY);

function getStripeClient(): Stripe {
  if (!SECRET_KEY) {
    throw new Error("Stripe no está configurado (falta STRIPE_SECRET_KEY).");
  }
  return new Stripe(SECRET_KEY, { apiVersion: "2026-08-26.dahlia" });
}

/** Checkout Sessions expire after this long, releasing the held dates. */
const CHECKOUT_EXPIRY_MINUTES = 30;

export async function createCheckoutSession(params: {
  bookingId: string;
  bookingCode: string;
  amount: number; // major currency units, e.g. euros
  currency?: string;
  customerEmail: string;
  successUrl: string;
  cancelUrl: string;
}): Promise<Stripe.Checkout.Session> {
  const stripe = getStripeClient();

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
    expires_at: Math.floor(Date.now() / 1000) + CHECKOUT_EXPIRY_MINUTES * 60,
  });
}

export async function retrieveCheckoutSession(sessionId: string): Promise<Stripe.Checkout.Session> {
  const stripe = getStripeClient();
  return stripe.checkout.sessions.retrieve(sessionId);
}

export async function refundPayment(paymentIntentId: string): Promise<void> {
  const stripe = getStripeClient();
  await stripe.refunds.create({ payment_intent: paymentIntentId });
}

/** Verifies and parses an incoming Stripe webhook payload. */
export function constructWebhookEvent(rawBody: string, signature: string): Stripe.Event {
  if (!WEBHOOK_SECRET) {
    throw new Error("Stripe no está configurado (falta STRIPE_WEBHOOK_SECRET).");
  }
  const stripe = getStripeClient();
  return stripe.webhooks.constructEvent(rawBody, signature, WEBHOOK_SECRET);
}
