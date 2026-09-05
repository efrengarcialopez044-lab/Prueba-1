import Link from "next/link";
import { Clock, CheckCircle2, CalendarClock, Euro, TrendingUp } from "lucide-react";
import { getBookings, getProperty } from "@/lib/db";
import { nightsBetween } from "@/lib/bookings";
import { formatCurrency, formatDateLong } from "@/lib/utils";
import { StatCard } from "@/components/admin/StatCard";
import { Card, CardContent } from "@/components/ui/Card";
import { BookingStatusBadge } from "@/components/ui/Badge";

export default async function AdminDashboardPage() {
  const [bookings, property] = await Promise.all([getBookings(), getProperty()]);

  const today = new Date().toISOString().slice(0, 10);
  const in30Days = new Date();
  in30Days.setDate(in30Days.getDate() + 30);
  const in30 = in30Days.toISOString().slice(0, 10);

  const pending = bookings.filter((b) => b.status === "pending");
  const confirmed = bookings.filter((b) => b.status === "confirmed");
  const upcoming = bookings
    .filter((b) => b.status !== "cancelled" && b.check_out > today)
    .sort((a, b) => (a.check_in < b.check_in ? -1 : 1))
    .slice(0, 6);

  const estimatedRevenue = confirmed
    .filter((b) => b.check_in >= today)
    .reduce((sum, b) => sum + b.total_price, 0);

  const occupiedNights = confirmed.reduce((sum, b) => {
    const start = b.check_in < today ? today : b.check_in;
    const end = b.check_out > in30 ? in30 : b.check_out;
    return sum + Math.max(0, nightsBetween(start, end));
  }, 0);
  const occupancy = Math.round((occupiedNights / 30) * 100);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-serif text-3xl text-forest-800">Dashboard</h1>
        <p className="mt-1 text-forest-800/60">Resumen de la actividad de {property.name}.</p>
      </div>

      <div className="grid grid-cols-2 gap-5 lg:grid-cols-5">
        <StatCard icon={Clock} label="Pendientes" value={String(pending.length)} />
        <StatCard icon={CheckCircle2} label="Confirmadas" value={String(confirmed.length)} />
        <StatCard
          icon={CalendarClock}
          label="Próximas reservas"
          value={String(upcoming.length)}
        />
        <StatCard
          icon={Euro}
          label="Ingresos confirmados"
          value={formatCurrency(estimatedRevenue)}
          hint="Reservas confirmadas futuras"
        />
        <StatCard
          icon={TrendingUp}
          label="Ocupación (30 días)"
          value={`${occupancy}%`}
        />
      </div>

      <Card>
        <CardContent>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-serif text-xl text-forest-800">Próximas reservas</h2>
            <Link href="/admin/reservas" className="text-sm text-terracotta-600 hover:underline">
              Ver todas
            </Link>
          </div>

          {upcoming.length === 0 ? (
            <p className="py-8 text-center text-sm text-forest-800/50">
              No hay reservas próximas.
            </p>
          ) : (
            <div className="divide-y divide-sand-200">
              {upcoming.map((b) => (
                <Link
                  key={b.id}
                  href={`/admin/reservas/${b.id}`}
                  className="flex items-center justify-between py-3.5 text-sm hover:bg-sand-50"
                >
                  <div>
                    <p className="font-medium text-forest-800">
                      {b.guest_name} {b.guest_last_name}
                    </p>
                    <p className="text-forest-800/50">
                      {formatDateLong(b.check_in)} → {formatDateLong(b.check_out)}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-forest-800/70">{formatCurrency(b.total_price)}</span>
                    <BookingStatusBadge status={b.status} />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
