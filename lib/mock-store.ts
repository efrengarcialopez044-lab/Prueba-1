import {
  mockBlockedDates,
  mockBookings,
  mockImages,
  mockProperty,
} from "./mock-data";
import type { BlockedDate, Booking, Property, PropertyImage } from "./types";

/**
 * In-memory "database" used when Supabase env vars are not set, so the app
 * is fully clickable (create/confirm/cancel bookings, block dates, edit
 * settings) without any external service. Kept on `globalThis` so it
 * survives Next.js dev hot-reloads within the same server process.
 *
 * This is a demo convenience only — every function here has a Supabase
 * equivalent in lib/db.ts that runs instead once env vars are configured.
 */
interface MockDb {
  property: Property;
  images: PropertyImage[];
  bookings: Booking[];
  blockedDates: BlockedDate[];
}

const globalForMock = globalThis as unknown as { __mockDb?: MockDb };

function seed(): MockDb {
  return {
    property: { ...mockProperty },
    images: mockImages.map((i) => ({ ...i })),
    bookings: mockBookings.map((b) => ({ ...b })),
    blockedDates: mockBlockedDates.map((b) => ({ ...b })),
  };
}

export function getMockDb(): MockDb {
  if (!globalForMock.__mockDb) {
    globalForMock.__mockDb = seed();
  }
  return globalForMock.__mockDb;
}
