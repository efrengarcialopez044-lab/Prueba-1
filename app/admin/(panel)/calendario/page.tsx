import { getBlockedDates, getProperty } from "@/lib/db";
import { AdminCalendar } from "@/components/admin/AdminCalendar";

export default async function AdminCalendarPage() {
  const [property, blockedDates] = await Promise.all([getProperty(), getBlockedDates()]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl text-forest-800">Calendario</h1>
        <p className="mt-1 text-forest-800/60">
          Consulta la ocupación, bloquea fechas o crea reservas manuales.
        </p>
      </div>
      <AdminCalendar property={property} blockedDates={blockedDates} />
    </div>
  );
}
