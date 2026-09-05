export type BookingStatus = "pending" | "confirmed" | "cancelled";

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
  google_event_id: string | null;
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
