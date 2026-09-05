import type { Metadata } from "next";
import { getProperty } from "@/lib/db";
import { Header } from "@/components/landing/Header";
import { Footer } from "@/components/landing/Footer";
import { Container } from "@/components/ui/Container";
import { BookingWizard } from "@/components/booking/BookingWizard";

export const metadata: Metadata = { title: "Reservar — Casa Elody" };

export default async function ReservarPage() {
  const property = await getProperty();

  return (
    <>
      <Header propertyName={property.name} />
      <main className="py-14 sm:py-20">
        <Container>
          <div className="mb-10">
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-terracotta-600">
              Reserva tu estancia
            </p>
            <h1 className="font-serif text-3xl text-forest-800 sm:text-4xl">{property.name}</h1>
            <p className="mt-2 text-forest-800/60">{property.city}</p>
          </div>

          <BookingWizard property={property} />
        </Container>
      </main>
      <Footer property={property} />
    </>
  );
}
