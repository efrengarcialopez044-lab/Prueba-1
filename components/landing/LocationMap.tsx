import { MapPin } from "lucide-react";
import { Container, SectionHeading } from "@/components/ui/Container";
import type { Property } from "@/lib/types";

export function LocationMap({ property }: { property: Property }) {
  const delta = 0.02;
  const bbox = [
    property.lng - delta,
    property.lat - delta,
    property.lng + delta,
    property.lat + delta,
  ].join(",");
  const src = `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${property.lat},${property.lng}`;

  return (
    <section className="py-20 sm:py-28">
      <Container className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
        <div>
          <SectionHeading
            eyebrow="Ubicación"
            title="Frente al Atlántico, cerca de todo"
          />
          <p className="mt-4 flex items-start gap-2 text-base text-forest-800/80">
            <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-terracotta-600" />
            {property.address}, {property.city}
          </p>
          <p className="mt-4 text-sm text-forest-800/60">
            A pocos minutos de la Playa de las Catedrales, espacio natural protegido y
            declarado Monumento Natural. La dirección exacta y las indicaciones de acceso se
            envían por email tras confirmar la reserva.
          </p>
        </div>

        <div className="aspect-video overflow-hidden rounded-2xl border border-sand-200">
          <iframe
            title="Mapa de ubicación"
            src={src}
            className="h-full w-full"
            loading="lazy"
          />
        </div>
      </Container>
    </section>
  );
}
