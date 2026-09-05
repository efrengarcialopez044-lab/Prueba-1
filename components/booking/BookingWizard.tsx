"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { addMonths, format } from "date-fns";
import { CalendarGrid, CalendarLegend } from "@/components/booking/CalendarGrid";
import { GuestSelector } from "@/components/booking/GuestSelector";
import { PriceBreakdown } from "@/components/booking/PriceBreakdown";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input, Label, Textarea, FieldError } from "@/components/ui/Field";
import { calculatePrice } from "@/lib/bookings";
import type { DayAvailability } from "@/lib/bookings";
import type { Property } from "@/lib/types";

const MONTHS_AHEAD = 12;

export function BookingWizard({
  property,
  stripeEnabled = false,
}: {
  property: Property;
  stripeEnabled?: boolean;
}) {
  const router = useRouter();
  const [availability, setAvailability] = useState<Record<string, DayAvailability>>({});
  const [loadingAvailability, setLoadingAvailability] = useState(true);
  const [monthOffset, setMonthOffset] = useState(0);

  const [checkIn, setCheckIn] = useState<string | null>(null);
  const [checkOut, setCheckOut] = useState<string | null>(null);
  const [hoverDate, setHoverDate] = useState<string | null>(null);
  const [guests, setGuests] = useState(2);

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    notes: "",
  });
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const from = format(new Date(), "yyyy-MM-dd");
    const to = format(addMonths(new Date(), MONTHS_AHEAD), "yyyy-MM-dd");
    fetch(`/api/availability?from=${from}&to=${to}`)
      .then((res) => res.json())
      .then((data) => setAvailability(data.availability ?? {}))
      .finally(() => setLoadingAvailability(false));
  }, []);

  const price = useMemo(
    () => calculatePrice(checkIn ?? "", checkOut ?? "", property),
    [checkIn, checkOut, property]
  );

  function handleDayClick(iso: string, status: DayAvailability) {
    if (status !== "available") return;

    if (!checkIn || (checkIn && checkOut)) {
      setCheckIn(iso);
      setCheckOut(null);
      return;
    }

    if (iso <= checkIn) {
      setCheckIn(iso);
      return;
    }

    // Reject a range that would swallow a booked/blocked day.
    const spansUnavailable = Object.entries(availability).some(
      ([day, s]) => day > checkIn && day < iso && s !== "available"
    );
    if (spansUnavailable) {
      setCheckIn(iso);
      setCheckOut(null);
      return;
    }

    setCheckOut(iso);
  }

  const baseMonth = new Date();
  baseMonth.setDate(1);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitError(null);
    setErrors({});

    if (!checkIn || !checkOut) {
      setSubmitError("Selecciona fecha de entrada y salida en el calendario.");
      return;
    }
    if (!acceptedTerms) {
      setErrors({ acceptedTerms: "Debes aceptar los términos y condiciones" });
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          checkIn,
          checkOut,
          guests,
          ...form,
          acceptedTerms,
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        setSubmitError(data.error ?? "No se pudo crear la reserva");
        setSubmitting(false);
        return;
      }

      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
        return;
      }

      router.push(`/reserva-confirmada/${data.booking.booking_code}`);
    } catch {
      setSubmitError("Error de conexión. Inténtalo de nuevo.");
      setSubmitting(false);
    }
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1.3fr_1fr] lg:items-start">
      <Card>
        <CardContent>
          <h2 className="mb-1 font-serif text-2xl text-forest-800">1. Elige tus fechas</h2>
          <p className="mb-6 text-sm text-forest-800/60">
            Selecciona primero la fecha de entrada y después la de salida.
          </p>

          {loadingAvailability ? (
            <p className="py-10 text-center text-sm text-forest-800/50">
              Cargando disponibilidad…
            </p>
          ) : (
            <div
              className="grid gap-8 sm:grid-cols-2"
              onMouseLeave={() => setHoverDate(null)}
            >
              <CalendarGrid
                month={addMonths(baseMonth, monthOffset)}
                availability={availability}
                selectedStart={checkIn}
                selectedEnd={checkOut}
                hoverEnd={hoverDate}
                onDayClick={handleDayClick}
                onPrevMonth={monthOffset > 0 ? () => setMonthOffset((o) => o - 1) : undefined}
                onNextMonth={
                  monthOffset < MONTHS_AHEAD - 1 ? () => setMonthOffset((o) => o + 1) : undefined
                }
              />
              <CalendarGrid
                month={addMonths(baseMonth, monthOffset + 1)}
                availability={availability}
                selectedStart={checkIn}
                selectedEnd={checkOut}
                hoverEnd={hoverDate}
                onDayClick={handleDayClick}
                onNextMonth={
                  monthOffset + 1 < MONTHS_AHEAD - 1
                    ? () => setMonthOffset((o) => o + 1)
                    : undefined
                }
              />
            </div>
          )}

          <div className="mt-6">
            <CalendarLegend />
          </div>
        </CardContent>
      </Card>

      <div className="space-y-6 lg:sticky lg:top-24">
        <Card>
          <CardContent className="space-y-5">
            <h2 className="font-serif text-2xl text-forest-800">2. Detalles y precio</h2>

            <GuestSelector value={guests} max={property.max_guests} onChange={setGuests} />
            <PriceBreakdown price={price} checkIn={checkIn} checkOut={checkOut} />
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <h2 className="mb-5 font-serif text-2xl text-forest-800">
              3. {stripeEnabled ? "Tus datos y pago" : "Tus datos"}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName">Nombre</Label>
                  <Input
                    id="firstName"
                    required
                    value={form.firstName}
                    onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="lastName">Apellidos</Label>
                  <Input
                    id="lastName"
                    required
                    value={form.lastName}
                    onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="phone">Teléfono</Label>
                <Input
                  id="phone"
                  type="tel"
                  required
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="notes">Comentarios (opcional)</Label>
                <Textarea
                  id="notes"
                  rows={3}
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  placeholder="Hora estimada de llegada, peticiones especiales…"
                />
              </div>

              <div className="rounded-xl bg-sand-100 p-4 text-xs leading-relaxed text-forest-800/70">
                <strong className="text-forest-800">Política de cancelación:</strong> puedes
                cancelar sin coste hasta {property.cancellation_deadline_days} días antes de la
                fecha de entrada
                {stripeEnabled ? " y se te reembolsará el pago íntegro" : ""}. Pasado ese plazo,
                la reserva no podrá cancelarse.
              </div>

              <label className="flex items-start gap-2.5 text-sm text-forest-800/80">
                <input
                  type="checkbox"
                  checked={acceptedTerms}
                  onChange={(e) => setAcceptedTerms(e.target.checked)}
                  className="mt-0.5 h-4 w-4 rounded border-sand-300"
                />
                Acepto los términos y condiciones y la política de cancelación.
              </label>
              <FieldError>{errors.acceptedTerms}</FieldError>

              {submitError && (
                <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
                  {submitError}
                </p>
              )}

              <Button type="submit" className="w-full justify-center" disabled={submitting}>
                {submitting
                  ? "Procesando…"
                  : stripeEnabled
                    ? "Pagar y reservar ahora"
                    : "Enviar solicitud de reserva"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
