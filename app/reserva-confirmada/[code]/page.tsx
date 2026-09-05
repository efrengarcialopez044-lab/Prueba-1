import { notFound } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import { getBookingByCode, getProperty } from "@/lib/db";
import { canGuestCancel } from "@/lib/bookings";
import { formatCurrency, formatDateLong } from "@/lib/utils";
import { Header } from "@/components/landing/Header";
import { Footer } from "@/components/landing/Footer";
import { Container } from "@/components/ui/Container";
import { Card, CardContent } from "@/components/ui/Card";
import { BookingStatusBadge } from "@/components/ui/Badge";
import { CancelBookingButton } from "@/components/booking/CancelBookingButton";

interface Props {
  params: Promise<{ code: string }>;
}

export default async function BookingConfirmedPage({ params }: Props) {
  const { code } = await params;
  const [booking, property] = await Promise.all([getBookingByCode(code), getProperty()]);

  if (!booking) notFound();

  const canCancel =
    booking.status !== "cancelled" &&
    canGuestCancel(booking.check_in, property.cancellation_deadline_days);

  return (
    <>
      <Header propertyName={property.name} />
      <main className="py-16 sm:py-24">
        <Container className="max-w-2xl">
          <div className="text-center">
            <CheckCircle2 className="mx-auto h-12 w-12 text-forest-600" />
            <h1 className="mt-4 font-serif text-3xl text-forest-800 sm:text-4xl">
              Solicitud de reserva recibida
            </h1>
            <p className="mt-3 text-forest-800/70">
              Te hemos enviado un email con los detalles. El propietario confirmará tu reserva en
              breve.
            </p>
          </div>

          <Card className="mt-10">
            <CardContent className="space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-wide text-forest-800/50">
                    Código de reserva
                  </p>
                  <p className="font-serif text-2xl text-forest-800">{booking.booking_code}</p>
                </div>
                <BookingStatusBadge status={booking.status} />
              </div>

              <div className="grid grid-cols-2 gap-4 border-t border-sand-200 pt-5 text-sm">
                <div>
                  <p className="text-forest-800/50">Entrada</p>
                  <p className="font-medium text-forest-800">
                    {formatDateLong(booking.check_in)}
                  </p>
                </div>
                <div>
                  <p className="text-forest-800/50">Salida</p>
                  <p className="font-medium text-forest-800">
                    {formatDateLong(booking.check_out)}
                  </p>
                </div>
                <div>
                  <p className="text-forest-800/50">Huéspedes</p>
                  <p className="font-medium text-forest-800">{booking.guests}</p>
                </div>
                <div>
                  <p className="text-forest-800/50">Precio total</p>
                  <p className="font-medium text-forest-800">
                    {formatCurrency(booking.total_price)}
                  </p>
                </div>
              </div>

              <div className="rounded-xl bg-sand-100 p-4 text-sm text-forest-800/70">
                <p className="mb-1 font-medium text-forest-800">Siguientes pasos</p>
                <p>
                  Revisaremos la disponibilidad y te confirmaremos por email
                  ({booking.guest_email}) en un plazo máximo de 24 horas. Guarda tu código de
                  reserva para cualquier consulta.
                </p>
              </div>

              {booking.status !== "cancelled" && (
                <div className="border-t border-sand-200 pt-5">
                  {canCancel ? (
                    <CancelBookingButton bookingId={booking.id} />
                  ) : (
                    <p className="text-sm text-forest-800/50">
                      Esta reserva ya no puede cancelarse: faltan menos de{" "}
                      {property.cancellation_deadline_days} días para el check-in.
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </Container>
      </main>
      <Footer property={property} />
    </>
  );
}
