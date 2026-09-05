import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Mail, Phone, Users, CalendarRange } from "lucide-react";
import { getBookingById } from "@/lib/db";
import { formatCurrency, formatDateLong } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/Card";
import { BookingStatusBadge } from "@/components/ui/Badge";
import { BookingRowActions } from "@/components/admin/BookingRowActions";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function AdminBookingDetailPage({ params }: Props) {
  const { id } = await params;
  const booking = await getBookingById(id);
  if (!booking) notFound();

  return (
    <div className="max-w-2xl space-y-6">
      <Link
        href="/admin/reservas"
        className="flex items-center gap-2 text-sm text-forest-800/60 hover:text-forest-800"
      >
        <ArrowLeft className="h-4 w-4" /> Volver a reservas
      </Link>

      <Card>
        <CardContent className="space-y-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs uppercase tracking-wide text-forest-800/50">
                {booking.booking_code}
              </p>
              <h1 className="font-serif text-2xl text-forest-800">
                {booking.guest_name} {booking.guest_last_name}
              </h1>
            </div>
            <BookingStatusBadge status={booking.status} />
          </div>

          <div className="grid grid-cols-2 gap-4 border-t border-sand-200 pt-5 text-sm">
            <Info icon={Mail} label="Email" value={booking.guest_email} />
            <Info icon={Phone} label="Teléfono" value={booking.guest_phone} />
            <Info
              icon={CalendarRange}
              label="Estancia"
              value={`${formatDateLong(booking.check_in)} → ${formatDateLong(booking.check_out)}`}
            />
            <Info icon={Users} label="Huéspedes" value={String(booking.guests)} />
          </div>

          <div className="grid grid-cols-3 gap-4 border-t border-sand-200 pt-5 text-sm">
            <div>
              <p className="text-forest-800/50">Precio/noche</p>
              <p className="font-medium text-forest-800">
                {formatCurrency(booking.price_per_night)}
              </p>
            </div>
            <div>
              <p className="text-forest-800/50">Limpieza</p>
              <p className="font-medium text-forest-800">
                {formatCurrency(booking.cleaning_fee)}
              </p>
            </div>
            <div>
              <p className="text-forest-800/50">Total</p>
              <p className="font-medium text-forest-800">
                {formatCurrency(booking.total_price)}
              </p>
            </div>
          </div>

          {booking.notes && (
            <div className="border-t border-sand-200 pt-5">
              <p className="mb-1 text-sm text-forest-800/50">Comentarios del huésped</p>
              <p className="text-sm text-forest-800">{booking.notes}</p>
            </div>
          )}

          <div className="flex justify-end border-t border-sand-200 pt-5">
            <BookingRowActions bookingId={booking.id} status={booking.status} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function Info({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Mail;
  label: string;
  value: string;
}) {
  return (
    <div>
      <p className="flex items-center gap-1.5 text-forest-800/50">
        <Icon className="h-3.5 w-3.5" /> {label}
      </p>
      <p className="mt-0.5 font-medium text-forest-800">{value}</p>
    </div>
  );
}
