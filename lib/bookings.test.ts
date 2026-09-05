import { describe, expect, it } from "vitest";
import {
  buildAvailabilityMap,
  calculatePrice,
  canGuestCancel,
  daysUntilCheckIn,
  generateBookingCode,
  nightsBetween,
  rangesOverlap,
  validateBookingRange,
} from "./bookings";

describe("rangesOverlap", () => {
  it("detects overlapping ranges", () => {
    expect(rangesOverlap("2026-01-10", "2026-01-15", "2026-01-12", "2026-01-18")).toBe(true);
  });

  it("treats check_out as exclusive (back-to-back stays don't overlap)", () => {
    expect(rangesOverlap("2026-01-10", "2026-01-15", "2026-01-15", "2026-01-20")).toBe(false);
  });

  it("returns false for ranges with a gap", () => {
    expect(rangesOverlap("2026-01-01", "2026-01-05", "2026-01-10", "2026-01-15")).toBe(false);
  });
});

describe("nightsBetween", () => {
  it("counts nights, not calendar days", () => {
    expect(nightsBetween("2026-06-10", "2026-06-13")).toBe(3);
  });

  it("returns 0 for the same day", () => {
    expect(nightsBetween("2026-06-10", "2026-06-10")).toBe(0);
  });
});

describe("calculatePrice", () => {
  const property = { price_per_night: 180, cleaning_fee: 50 };

  it("multiplies nights by the nightly rate and adds the cleaning fee once", () => {
    const price = calculatePrice("2026-07-01", "2026-07-04", property);
    expect(price).toEqual({
      nights: 3,
      pricePerNight: 180,
      subtotal: 540,
      cleaningFee: 50,
      total: 590,
    });
  });

  it("charges no cleaning fee for a zero-night (invalid) range", () => {
    const price = calculatePrice("2026-07-01", "2026-07-01", property);
    expect(price.nights).toBe(0);
    expect(price.cleaningFee).toBe(0);
    expect(price.total).toBe(0);
  });
});

describe("validateBookingRange", () => {
  const baseInput = {
    checkIn: "2099-01-10",
    checkOut: "2099-01-13",
    guests: 2,
    maxGuests: 8,
    existingBookings: [],
    blockedDates: [],
  };

  it("accepts a valid, available range", () => {
    expect(validateBookingRange(baseInput)).toEqual({ valid: true });
  });

  it("rejects checkout before or equal to checkin", () => {
    const result = validateBookingRange({ ...baseInput, checkOut: baseInput.checkIn });
    expect(result.valid).toBe(false);
  });

  it("rejects dates in the past", () => {
    const result = validateBookingRange({
      ...baseInput,
      checkIn: "2000-01-01",
      checkOut: "2000-01-05",
    });
    expect(result.valid).toBe(false);
  });

  it("rejects more guests than the property allows", () => {
    const result = validateBookingRange({ ...baseInput, guests: 99 });
    expect(result.valid).toBe(false);
  });

  it("rejects a range overlapping an existing non-cancelled booking", () => {
    const result = validateBookingRange({
      ...baseInput,
      existingBookings: [
        { check_in: "2099-01-11", check_out: "2099-01-12", status: "confirmed" },
      ],
    });
    expect(result.valid).toBe(false);
  });

  it("ignores cancelled bookings when checking overlap", () => {
    const result = validateBookingRange({
      ...baseInput,
      existingBookings: [
        { check_in: "2099-01-11", check_out: "2099-01-12", status: "cancelled" },
      ],
    });
    expect(result.valid).toBe(true);
  });

  it("rejects a range overlapping a manually blocked range", () => {
    const result = validateBookingRange({
      ...baseInput,
      blockedDates: [{ start_date: "2099-01-12", end_date: "2099-01-20" }],
    });
    expect(result.valid).toBe(false);
  });

  it("enforces a minimum stay when configured", () => {
    const result = validateBookingRange({ ...baseInput, checkOut: "2099-01-11", minNights: 2 });
    expect(result.valid).toBe(false);
  });
});

describe("buildAvailabilityMap", () => {
  it("marks booked, blocked and available days independently", () => {
    const map = buildAvailabilityMap(
      "2099-03-01",
      "2099-03-06",
      [{ check_in: "2099-03-02", check_out: "2099-03-04", status: "confirmed" }],
      [{ start_date: "2099-03-04", end_date: "2099-03-05" }]
    );

    expect(map).toEqual({
      "2099-03-01": "available",
      "2099-03-02": "booked",
      "2099-03-03": "booked",
      "2099-03-04": "blocked",
      "2099-03-05": "available",
    });
  });

  it("ignores cancelled bookings", () => {
    const map = buildAvailabilityMap(
      "2099-03-01",
      "2099-03-03",
      [{ check_in: "2099-03-01", check_out: "2099-03-03", status: "cancelled" }],
      []
    );
    expect(map["2099-03-01"]).toBe("available");
  });
});

describe("cancellation policy", () => {
  const now = new Date("2026-06-01T00:00:00Z");

  it("computes whole days remaining until check-in", () => {
    expect(daysUntilCheckIn("2026-06-08", now)).toBe(7);
  });

  it("allows cancelling exactly at the deadline", () => {
    expect(canGuestCancel("2026-06-08", 7, now)).toBe(true);
  });

  it("blocks cancelling once inside the deadline window", () => {
    expect(canGuestCancel("2026-06-07", 7, now)).toBe(false);
  });
});

describe("generateBookingCode", () => {
  it("produces a CE-##### style code", () => {
    expect(generateBookingCode()).toMatch(/^CE-\d{5}$/);
  });
});
