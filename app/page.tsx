import { addDays, format } from "date-fns";
import { getBlockedDates, getBookings, getProperty, getPropertyImages } from "@/lib/db";
import { buildAvailabilityMap } from "@/lib/bookings";
import { mockFaqs } from "@/lib/mock-data";
import { Header } from "@/components/landing/Header";
import { Hero } from "@/components/landing/Hero";
import { Gallery } from "@/components/landing/Gallery";
import { Description } from "@/components/landing/Description";
import { Amenities } from "@/components/landing/Amenities";
import { LocationMap } from "@/components/landing/LocationMap";
import { AvailabilityPreview } from "@/components/landing/AvailabilityPreview";
import { Faq } from "@/components/landing/Faq";
import { Contact } from "@/components/landing/Contact";
import { Footer } from "@/components/landing/Footer";
import { Container, SectionHeading } from "@/components/ui/Container";

const MONTHS_PREVIEW = 3;

export default async function HomePage() {
  const [property, images, bookings, blockedDates] = await Promise.all([
    getProperty(),
    getPropertyImages(),
    getBookings(),
    getBlockedDates(),
  ]);

  const today = format(new Date(), "yyyy-MM-dd");
  const rangeEnd = format(addDays(new Date(), MONTHS_PREVIEW * 31), "yyyy-MM-dd");
  const availability = buildAvailabilityMap(today, rangeEnd, bookings, blockedDates);

  return (
    <>
      <Header propertyName={property.name} />
      <main>
        <Hero property={property} heroImage={images[0]} />
        <Gallery images={images} />
        <Description property={property} />
        <Amenities amenities={property.amenities} />
        <LocationMap property={property} />

        <section id="disponibilidad" className="bg-sand-100/60 py-20 sm:py-28">
          <Container>
            <SectionHeading
              eyebrow="Disponibilidad"
              title="Consulta el calendario antes de reservar"
              description="Los días marcados como ocupados o bloqueados no están disponibles."
              className="mb-10"
            />
            <AvailabilityPreview availability={availability} monthsAvailable={MONTHS_PREVIEW} />
          </Container>
        </section>

        <Faq faqs={mockFaqs} />
        <Contact property={property} />
      </main>
      <Footer property={property} />
    </>
  );
}
