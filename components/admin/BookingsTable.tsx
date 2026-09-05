"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { cn, formatCurrency, formatDateShort } from "@/lib/utils";
import { BookingStatusBadge } from "@/components/ui/Badge";
import { BookingRowActions } from "@/components/admin/BookingRowActions";
import type { Booking, BookingStatus } from "@/lib/types";

const tabs: { key: BookingStatus | "all"; label: string }[] = [
  { key: "all", label: "Todas" },
  { key: "pending", label: "Pendientes" },
  { key: "confirmed", label: "Confirmadas" },
  { key: "cancelled", label: "Canceladas" },
];

export function BookingsTable({ bookings }: { bookings: Booking[] }) {
  const [tab, setTab] = useState<BookingStatus | "all">("all");

  const filtered = useMemo(
    () => (tab === "all" ? bookings : bookings.filter((b) => b.status === tab)),
    [bookings, tab]
  );

  return (
    <div>
      <div className="mb-5 flex gap-2">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={cn(
              "rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
              tab === t.key
                ? "bg-forest-800 text-white"
                : "bg-sand-100 text-forest-800/70 hover:bg-sand-200"
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="overflow-x-auto rounded-2xl border border-sand-200 bg-white">
        <table className="w-full min-w-[900px] text-left text-sm">
          <thead>
            <tr className="border-b border-sand-200 text-xs uppercase tracking-wide text-forest-800/50">
              <th className="px-5 py-3 font-medium">Cliente</th>
              <th className="px-5 py-3 font-medium">Contacto</th>
              <th className="px-5 py-3 font-medium">Entrada</th>
              <th className="px-5 py-3 font-medium">Salida</th>
              <th className="px-5 py-3 font-medium">Huéspedes</th>
              <th className="px-5 py-3 font-medium">Total</th>
              <th className="px-5 py-3 font-medium">Estado</th>
              <th className="px-5 py-3 font-medium text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-sand-100">
            {filtered.map((b) => (
              <tr key={b.id} className="hover:bg-sand-50">
                <td className="px-5 py-4">
                  <Link href={`/admin/reservas/${b.id}`} className="font-medium text-forest-800 hover:underline">
                    {b.guest_name} {b.guest_last_name}
                  </Link>
                  <p className="text-xs text-forest-800/40">{b.booking_code}</p>
                </td>
                <td className="px-5 py-4 text-forest-800/70">
                  <p>{b.guest_email}</p>
                  <p className="text-xs">{b.guest_phone}</p>
                </td>
                <td className="px-5 py-4 text-forest-800/70">{formatDateShort(b.check_in)}</td>
                <td className="px-5 py-4 text-forest-800/70">{formatDateShort(b.check_out)}</td>
                <td className="px-5 py-4 text-forest-800/70">{b.guests}</td>
                <td className="px-5 py-4 text-forest-800/70">{formatCurrency(b.total_price)}</td>
                <td className="px-5 py-4">
                  <BookingStatusBadge status={b.status} />
                </td>
                <td className="px-5 py-4">
                  <BookingRowActions bookingId={b.id} status={b.status} compact />
                </td>
              </tr>
            ))}

            {filtered.length === 0 && (
              <tr>
                <td colSpan={8} className="px-5 py-10 text-center text-forest-800/50">
                  No hay reservas en esta categoría.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
