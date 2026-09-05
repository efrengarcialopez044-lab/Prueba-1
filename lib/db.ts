import "server-only";
import { isSupabaseConfigured, createClient, createAdminClient } from "./supabase/server";
import { getMockDb } from "./mock-store";
import {
  calculatePrice,
  canGuestCancel,
  generateBookingCode,
  validateBookingRange,
} from "./bookings";
import type { BookingFieldsInput, PropertySettingsInput } from "./validations";
import type { BlockedDate, Booking, BookingStatus, Property, PropertyImage } from "./types";
import { createBookingCalendarEvent, deleteBookingCalendarEvent } from "./google-calendar";
import { refundPayment } from "./stripe";

export class BookingError extends Error {}

// ---------------------------------------------------------------------------
// Property
// ---------------------------------------------------------------------------

export async function getProperty(): Promise<Property> {
  if (!isSupabaseConfigured) {
    return getMockDb().property;
  }
  const supabase = await createClient();
  const { data, error } = await supabase.from("properties").select("*").single();
  if (error) throw new BookingError(error.message);
  return data as Property;
}

export async function getPropertyImages(): Promise<PropertyImage[]> {
  if (!isSupabaseConfigured) {
    return [...getMockDb().images].sort((a, b) => a.sort_order - b.sort_order);
  }
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("property_images")
    .select("*")
    .order("sort_order", { ascending: true });
  if (error) throw new BookingError(error.message);
  return data as PropertyImage[];
}

export async function updatePropertySettings(
  patch: PropertySettingsInput
): Promise<Property> {
  if (!isSupabaseConfigured) {
    const db = getMockDb();
    db.property = { ...db.property, ...patch, updated_at: new Date().toISOString() };
    return db.property;
  }
  const supabase = createAdminClient();
  const property = await getProperty();
  const { data, error } = await supabase
    .from("properties")
    .update({ ...patch, updated_at: new Date().toISOString() })
    .eq("id", property.id)
    .select()
    .single();
  if (error) throw new BookingError(error.message);
  return data as Property;
}

export async function addPropertyImage(input: { url: string; alt: string }): Promise<PropertyImage> {
  const property = await getProperty();

  if (!isSupabaseConfigured) {
    const db = getMockDb();
    const record: PropertyImage = {
      id: crypto.randomUUID(),
      property_id: property.id,
      url: input.url,
      alt: input.alt,
      sort_order: db.images.length,
    };
    db.images.push(record);
    return record;
  }

  const supabase = createAdminClient();
  const images = await getPropertyImages();
  const { data, error } = await supabase
    .from("property_images")
    .insert({ property_id: property.id, url: input.url, alt: input.alt, sort_order: images.length })
    .select()
    .single();
  if (error) throw new BookingError(error.message);
  return data as PropertyImage;
}

export async function removePropertyImage(id: string): Promise<void> {
  if (!isSupabaseConfigured) {
    const db = getMockDb();
    db.images = db.images.filter((i) => i.id !== id);
    return;
  }
  const supabase = createAdminClient();
  const { error } = await supabase.from("property_images").delete().eq("id", id);
  if (error) throw new BookingError(error.message);
}

// ---------------------------------------------------------------------------
// Blocked dates
// ---------------------------------------------------------------------------

export async function getBlockedDates(): Promise<BlockedDate[]> {
  if (!isSupabaseConfigured) {
    return [...getMockDb().blockedDates];
  }
  const supabase = await createClient();
  const { data, error } = await supabase.from("blocked_dates").select("*");
  if (error) throw new BookingError(error.message);
  return data as BlockedDate[];
}

export async function addBlockedDate(input: {
  startDate: string;
  endDate: string;
  reason?: string;
}): Promise<BlockedDate> {
  const property = await getProperty();

  if (!isSupabaseConfigured) {
    const db = getMockDb();
    const record: BlockedDate = {
      id: crypto.randomUUID(),
      property_id: property.id,
      start_date: input.startDate,
      end_date: input.endDate,
      reason: input.reason ?? null,
    };
    db.blockedDates.push(record);
    return record;
  }

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("blocked_dates")
    .insert({
      property_id: property.id,
      start_date: input.startDate,
      end_date: input.endDate,
      reason: input.reason ?? null,
    })
    .select()
    .single();
  if (error) throw new BookingError(error.message);
  return data as BlockedDate;
}

export async function removeBlockedDate(id: string): Promise<void> {
  if (!isSupabaseConfigured) {
    const db = getMockDb();
    db.blockedDates = db.blockedDates.filter((b) => b.id !== id);
    return;
  }
  const supabase = createAdminClient();
  const { error } = await supabase.from("blocked_dates").delete().eq("id", id);
  if (error) throw new BookingError(error.message);
}

// ---------------------------------------------------------------------------
// Bookings
// ---------------------------------------------------------------------------

export async function getBookings(): Promise<Booking[]> {
  if (!isSupabaseConfigured) {
    return [...getMockDb().bookings].sort((a, b) => (a.created_at < b.created_at ? 1 : -1));
  }
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("bookings")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw new BookingError(error.message);
  return data as Booking[];
}

export async function getBookingByCode(code: string): Promise<Booking | null> {
  if (!isSupabaseConfigured) {
    return getMockDb().bookings.find((b) => b.booking_code === code) ?? null;
  }
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("bookings")
    .select("*")
    .eq("booking_code", code)
    .maybeSingle();
  if (error) throw new BookingError(error.message);
  return data as Booking | null;
}

export async function getBookingById(id: string): Promise<Booking | null> {
  if (!isSupabaseConfigured) {
    return getMockDb().bookings.find((b) => b.id === id) ?? null;
  }
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("bookings")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) throw new BookingError(error.message);
  return data as Booking | null;
}

/**
 * Applies a partial update to a booking. Always uses elevated access
 * (service role / in-memory store directly) because every caller has
 * already done its own authorization check — the guest cancellation flow
 * is anonymous (no Supabase session to scope an RLS-respecting client to),
 * same as the public booking creation flow.
 */
async function patchBooking(id: string, patch: Partial<Booking>): Promise<Booking> {
  if (!isSupabaseConfigured) {
    const db = getMockDb();
    const idx = db.bookings.findIndex((b) => b.id === id);
    if (idx === -1) throw new BookingError("Reserva no encontrada");
    db.bookings[idx] = { ...db.bookings[idx], ...patch };
    return db.bookings[idx];
  }

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("bookings")
    .update(patch)
    .eq("id", id)
    .select()
    .single();
  if (error) throw new BookingError(error.message);
  return data as Booking;
}

/**
 * Validates availability and computes the price server-side, then persists
 * the booking as a "pending" request. This is the single entry point for
 * both the public booking form and the admin's manual-booking tool, so the
 * anti-overlap rule can never be bypassed by a crafted request.
 */
export async function createBooking(
  input: BookingFieldsInput,
  options: { status?: BookingStatus } = {}
): Promise<Booking> {
  const property = await getProperty();
  const [existingBookings, blockedDates] = await Promise.all([
    getBookings(),
    getBlockedDates(),
  ]);

  const validation = validateBookingRange({
    checkIn: input.checkIn,
    checkOut: input.checkOut,
    guests: input.guests,
    maxGuests: property.max_guests,
    existingBookings,
    blockedDates,
  });

  if (!validation.valid) {
    throw new BookingError(validation.error ?? "Fechas no disponibles");
  }

  const price = calculatePrice(input.checkIn, input.checkOut, property);
  const status: BookingStatus = options.status ?? "pending";

  const record: Omit<Booking, "id"> = {
    booking_code: generateBookingCode(),
    property_id: property.id,
    user_id: null,
    guest_name: input.firstName,
    guest_last_name: input.lastName,
    guest_email: input.email,
    guest_phone: input.phone,
    check_in: input.checkIn,
    check_out: input.checkOut,
    guests: input.guests,
    nights: price.nights,
    price_per_night: price.pricePerNight,
    cleaning_fee: price.cleaningFee,
    total_price: price.total,
    status,
    notes: input.notes || null,
    google_event_id: null,
    stripe_session_id: null,
    stripe_payment_intent_id: null,
    paid_at: null,
    created_at: new Date().toISOString(),
  };

  // Admin manual bookings can be created already "confirmed" — sync the
  // calendar event up front so it exists from the very first read.
  if (status === "confirmed") {
    record.google_event_id = await createBookingCalendarEvent(
      { ...record, id: "" },
      property
    );
  }

  if (!isSupabaseConfigured) {
    const db = getMockDb();
    const booking: Booking = { ...record, id: crypto.randomUUID() };
    db.bookings.push(booking);
    return booking;
  }

  const supabase = createAdminClient();
  const { data, error } = await supabase.from("bookings").insert(record).select().single();
  if (error) {
    // Postgres exclusion constraint kicks in on a race condition between
    // the validation above and the insert.
    if (error.code === "23P01") {
      throw new BookingError("Las fechas seleccionadas ya no están disponibles.");
    }
    throw new BookingError(error.message);
  }
  return data as Booking;
}

/**
 * Updates a booking's status. Guest-initiated cancellations are checked
 * against the property's cancellation policy on the server, regardless of
 * what the client UI shows. Admins can override via `isAdmin`.
 */
export async function updateBookingStatus(
  id: string,
  status: BookingStatus,
  { isAdmin = false }: { isAdmin?: boolean } = {}
): Promise<Booking> {
  const booking = await getBookingById(id);
  if (!booking) throw new BookingError("Reserva no encontrada");

  const property = await getProperty();

  if (status === "cancelled" && !isAdmin) {
    if (!canGuestCancel(booking.check_in, property.cancellation_deadline_days)) {
      throw new BookingError(
        `Esta reserva ya no puede cancelarse: faltan menos de ${property.cancellation_deadline_days} días para el check-in.`
      );
    }
  }

  const patch: Partial<Booking> = { status };

  // Keep the owner's Google Calendar in sync with confirmations/cancellations.
  if (status === "confirmed" && !booking.google_event_id) {
    patch.google_event_id = await createBookingCalendarEvent(booking, property);
  } else if (status === "cancelled" && booking.google_event_id) {
    await deleteBookingCalendarEvent(booking.google_event_id);
    patch.google_event_id = null;
  }

  // Instant-booking payments are refunded automatically on any cancellation
  // (guest, within the policy window, or admin override).
  if (status === "cancelled" && booking.paid_at && booking.stripe_payment_intent_id) {
    try {
      await refundPayment(booking.stripe_payment_intent_id);
    } catch (error) {
      console.error("No se pudo reembolsar el pago en Stripe", error);
    }
  }

  return patchBooking(id, patch);
}

/**
 * Marks a booking paid and confirmed after a successful Stripe Checkout.
 * Idempotent: called from both the webhook and the confirmation page (in
 * case the webhook hasn't landed yet), so a second call is a no-op.
 */
export async function confirmBookingPayment(
  bookingId: string,
  sessionId: string,
  paymentIntentId: string | null
): Promise<Booking> {
  const booking = await getBookingById(bookingId);
  if (!booking) throw new BookingError("Reserva no encontrada");
  if (booking.paid_at) return booking;

  const property = await getProperty();
  const patch: Partial<Booking> = {
    status: "confirmed",
    stripe_session_id: sessionId,
    stripe_payment_intent_id: paymentIntentId,
    paid_at: new Date().toISOString(),
  };

  if (!booking.google_event_id) {
    patch.google_event_id = await createBookingCalendarEvent(
      { ...booking, ...patch },
      property
    );
  }

  return patchBooking(bookingId, patch);
}

/** Stores the Checkout Session id right after creating it, before the guest pays. */
export async function attachCheckoutSession(bookingId: string, sessionId: string): Promise<void> {
  await patchBooking(bookingId, { stripe_session_id: sessionId });
}

/**
 * Releases a booking that was held during checkout but never got paid
 * (the Stripe Checkout Session expired), freeing its dates.
 */
export async function releaseUnpaidBooking(bookingId: string): Promise<void> {
  const booking = await getBookingById(bookingId);
  if (!booking || booking.paid_at || booking.status === "cancelled") return;
  await patchBooking(bookingId, { status: "cancelled" });
}

export async function deleteBooking(id: string): Promise<void> {
  if (!isSupabaseConfigured) {
    const db = getMockDb();
    db.bookings = db.bookings.filter((b) => b.id !== id);
    return;
  }
  const supabase = createAdminClient();
  const { error } = await supabase.from("bookings").delete().eq("id", id);
  if (error) throw new BookingError(error.message);
}
