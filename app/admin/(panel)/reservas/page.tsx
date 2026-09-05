import { getBookings } from "@/lib/db";
import { BookingsTable } from "@/components/admin/BookingsTable";

export default async function AdminBookingsPage() {
  const bookings = await getBookings();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl text-forest-800">Reservas</h1>
        <p className="mt-1 text-forest-800/60">Gestiona todas las solicitudes y reservas.</p>
      </div>
      <BookingsTable bookings={bookings} />
    </div>
  );
}
