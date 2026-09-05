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
    created_at: new Date().toISOString(),
  };

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

  if (status === "cancelled" && !isAdmin) {
    const property = await getProperty();
    if (!canGuestCancel(booking.check_in, property.cancellation_deadline_days)) {
      throw new BookingError(
        `Esta reserva ya no puede cancelarse: faltan menos de ${property.cancellation_deadline_days} días para el check-in.`
      );
    }
  }

  if (!isSupabaseConfigured) {
    const db = getMockDb();
    const idx = db.bookings.findIndex((b) => b.id === id);
    if (idx === -1) throw new BookingError("Reserva no encontrada");
    db.bookings[idx] = { ...db.bookings[idx], status };
    return db.bookings[idx];
  }

  const supabase = isAdmin ? createAdminClient() : await createClient();
  const { data, error } = await supabase
    .from("bookings")
    .update({ status })
    .eq("id", id)
    .select()
    .single();
  if (error) throw new BookingError(error.message);
  return data as Booking;
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
