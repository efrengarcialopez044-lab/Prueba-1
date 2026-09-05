"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { addMonths, format } from "date-fns";
import { Trash2 } from "lucide-react";
import { CalendarGrid, CalendarLegend } from "@/components/booking/CalendarGrid";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input, Label, Textarea } from "@/components/ui/Field";
import { GuestSelector } from "@/components/booking/GuestSelector";
import { formatDateLong } from "@/lib/utils";
import type { DayAvailability } from "@/lib/bookings";
import type { BlockedDate, Property } from "@/lib/types";

const MONTHS_AHEAD = 12;

type Mode = "block" | "manual-booking";

export function AdminCalendar({
  property,
  blockedDates,
}: {
  property: Property;
  blockedDates: BlockedDate[];
}) {
  const router = useRouter();
  const [availability, setAvailability] = useState<Record<string, DayAvailability>>({});
  const [monthOffset, setMonthOffset] = useState(0);
  const [mode, setMode] = useState<Mode>("block");

  const [start, setStart] = useState<string | null>(null);
  const [end, setEnd] = useState<string | null>(null);
  const [reason, setReason] = useState("");
  const [guests, setGuests] = useState(2);
  const [form, setForm] = useState({ firstName: "", lastName: "", email: "", phone: "", notes: "" });
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const from = format(new Date(), "yyyy-MM-dd");
    const to = format(addMonths(new Date(), MONTHS_AHEAD), "yyyy-MM-dd");
    fetch(`/api/availability?from=${from}&to=${to}`)
      .then((res) => res.json())
      .then((data) => setAvailability(data.availability ?? {}));
  }, []);

  const baseMonth = useMemo(() => {
    const d = new Date();
    d.setDate(1);
    return d;
  }, []);

  function handleDayClick(iso: string, status: DayAvailability) {
    if (status !== "available") return;
    if (!start || (start && end)) {
      setStart(iso);
      setEnd(null);
      return;
    }
    if (iso <= start) {
      setStart(iso);
      return;
    }
    const spansUnavailable = Object.entries(availability).some(
      ([day, s]) => day > start && day < iso && s !== "available"
    );
    if (spansUnavailable) {
      setStart(iso);
      setEnd(null);
      return;
    }
    setEnd(iso);
  }

  function resetSelection() {
    setStart(null);
    setEnd(null);
    setReason("");
    setError(null);
  }

  async function handleBlock() {
    if (!start || !end) return;
    setSubmitting(true);
    setError(null);
    const res = await fetch("/api/blocked-dates", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ startDate: start, endDate: end, reason }),
    });
    const data = await res.json();
    setSubmitting(false);
    if (!res.ok) {
      setError(data.error ?? "No se pudo bloquear el rango");
      return;
    }
    resetSelection();
    router.refresh();
  }

  async function handleUnblock(id: string) {
    await fetch(`/api/blocked-dates/${id}`, { method: "DELETE" });
    router.refresh();
  }

  async function handleManualBooking(e: React.FormEvent) {
    e.preventDefault();
    if (!start || !end) {
      setError("Selecciona fecha de entrada y salida en el calendario.");
      return;
    }
    setSubmitting(true);
    setError(null);
    const res = await fetch("/api/bookings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        manual: true,
        checkIn: start,
        checkOut: end,
        guests,
        status: "confirmed",
        ...form,
      }),
    });
    const data = await res.json();
    setSubmitting(false);
    if (!res.ok) {
      setError(data.error ?? "No se pudo crear la reserva");
      return;
    }
    resetSelection();
    setForm({ firstName: "", lastName: "", email: "", phone: "", notes: "" });
    router.refresh();
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1.3fr_1fr] lg:items-start">
      <Card>
        <CardContent>
          <div
            className="grid gap-8 sm:grid-cols-2"
          >
            <CalendarGrid
              month={addMonths(baseMonth, monthOffset)}
              availability={availability}
              selectedStart={start}
              selectedEnd={end}
              onDayClick={handleDayClick}
              onPrevMonth={monthOffset > 0 ? () => setMonthOffset((o) => o - 1) : undefined}
              onNextMonth={
                monthOffset < MONTHS_AHEAD - 1 ? () => setMonthOffset((o) => o + 1) : undefined
              }
            />
            <CalendarGrid
              month={addMonths(baseMonth, monthOffset + 1)}
              availability={availability}
              selectedStart={start}
              selectedEnd={end}
              onDayClick={handleDayClick}
              onNextMonth={
                monthOffset + 1 < MONTHS_AHEAD - 1 ? () => setMonthOffset((o) => o + 1) : undefined
              }
            />
          </div>
          <div className="mt-6">
            <CalendarLegend />
          </div>
        </CardContent>
      </Card>

      <div className="space-y-6">
        <Card>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setMode("block");
                  resetSelection();
                }}
                className={`flex-1 rounded-full py-2 text-sm font-medium ${mode === "block" ? "bg-forest-800 text-white" : "bg-sand-100 text-forest-800/70"}`}
              >
                Bloquear fechas
              </button>
              <button
                onClick={() => {
                  setMode("manual-booking");
                  resetSelection();
                }}
                className={`flex-1 rounded-full py-2 text-sm font-medium ${mode === "manual-booking" ? "bg-forest-800 text-white" : "bg-sand-100 text-forest-800/70"}`}
              >
                Reserva manual
              </button>
            </div>

            <p className="text-sm text-forest-800/60">
              {start && end
                ? `${formatDateLong(start)} → ${formatDateLong(end)}`
                : "Selecciona un rango de fechas en el calendario."}
            </p>

            {mode === "block" ? (
              <div className="space-y-3">
                <div>
                  <Label htmlFor="reason">Motivo (opcional)</Label>
                  <Input
                    id="reason"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="Mantenimiento, uso propio…"
                  />
                </div>
                {error && <p className="text-sm text-red-600">{error}</p>}
                <Button
                  className="w-full justify-center"
                  disabled={!start || !end || submitting}
                  onClick={handleBlock}
                >
                  Bloquear fechas
                </Button>
              </div>
            ) : (
              <form onSubmit={handleManualBooking} className="space-y-3">
                <GuestSelector value={guests} max={property.max_guests} onChange={setGuests} />
                <div className="grid grid-cols-2 gap-3">
                  <Input
                    placeholder="Nombre"
                    required
                    value={form.firstName}
                    onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                  />
                  <Input
                    placeholder="Apellidos"
                    required
                    value={form.lastName}
                    onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                  />
                </div>
                <Input
                  type="email"
                  placeholder="Email"
                  required
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
                <Input
                  type="tel"
                  placeholder="Teléfono"
                  required
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                />
                <Textarea
                  rows={2}
                  placeholder="Notas internas (opcional)"
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                />
                {error && <p className="text-sm text-red-600">{error}</p>}
                <Button type="submit" className="w-full justify-center" disabled={submitting}>
                  Crear reserva confirmada
                </Button>
              </form>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <h3 className="mb-3 font-serif text-lg text-forest-800">Fechas bloqueadas</h3>
            {blockedDates.length === 0 ? (
              <p className="text-sm text-forest-800/50">No hay fechas bloqueadas manualmente.</p>
            ) : (
              <ul className="space-y-2">
                {blockedDates.map((b) => (
                  <li
                    key={b.id}
                    className="flex items-center justify-between rounded-lg bg-sand-100 px-3 py-2 text-sm"
                  >
                    <div>
                      <p className="text-forest-800">
                        {formatDateLong(b.start_date)} → {formatDateLong(b.end_date)}
                      </p>
                      {b.reason && <p className="text-xs text-forest-800/50">{b.reason}</p>}
                    </div>
                    <button
                      onClick={() => handleUnblock(b.id)}
                      className="rounded-full p-1.5 text-forest-800/50 hover:bg-white hover:text-red-600"
                      aria-label="Desbloquear"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
