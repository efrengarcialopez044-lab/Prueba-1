export type BookingStatus = "pending" | "confirmed" | "cancelled";
export type DocumentType = "dni" | "nie" | "pasaporte";

/**
 * A guest other than the lead booker. Spain's tourist-accommodation
 * registration rules (RD 933/2021, "check-in de viajeros") require every
 * occupant's identity to be on file, not just the person who booked.
 */
export interface Occupant {
  firstName: string;
  lastName: string;
  documentType: DocumentType;
  documentNumber: string;
  birthDate: string; // ISO date
  nationality: string;
}

export interface Property {
  id: string;
  name: string;
  tagline: string;
  description: string;
  address: string;
  city: string;
  lat: number;
  lng: number;
  price_per_night: number;
  cleaning_fee: number;
  max_guests: number;
  bedrooms: number;
  bathrooms: number;
  amenities: string[];
  contact_email: string;
  contact_phone: string;
  cancellation_deadline_days: number;
  updated_at: string;
}

export interface PropertyImage {
  id: string;
  property_id: string;
  url: string;
  alt: string;
  sort_order: number;
}

export interface Booking {
  id: string;
  booking_code: string;
  property_id: string;
  user_id: string | null;
  guest_name: string;
  guest_last_name: string;
  guest_email: string;
  guest_phone: string;
  check_in: string; // ISO date (yyyy-mm-dd)
  check_out: string; // ISO date
  guests: number;
  nights: number;
  price_per_night: number;
  cleaning_fee: number;
  total_price: number;
  status: BookingStatus;
  notes: string | null;
  // Datos legales exigidos por la normativa de registro de viajeros.
  // Nulos en reservas creadas antes de añadir este requisito.
  lead_document_type: DocumentType | null;
  lead_document_number: string | null;
  lead_birth_date: string | null;
  lead_nationality: string | null;
  address_street: string | null;
  address_postal_code: string | null;
  address_city: string | null;
  address_province: string | null;
  address_country: string | null;
  occupants: Occupant[];
  google_event_id: string | null;
  stripe_session_id: string | null;
  stripe_payment_intent_id: string | null;
  paid_at: string | null;
  created_at: string;
}

export interface BlockedDate {
  id: string;
  property_id: string;
  start_date: string; // ISO date, inclusive
  end_date: string; // ISO date, exclusive (checkout-style)
  reason: string | null;
}

export interface FaqItem {
  question: string;
  answer: string;
}

export interface PriceBreakdown {
  nights: number;
  pricePerNight: number;
  subtotal: number;
  cleaningFee: number;
  total: number;
}
