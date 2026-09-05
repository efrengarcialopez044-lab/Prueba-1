import { BedDouble, Bath, Users, Home } from "lucide-react";
import { Container, SectionHeading } from "@/components/ui/Container";
import type { Property } from "@/lib/types";

export function Description({ property }: { property: Property }) {
  const stats = [
    { icon: BedDouble, label: "Habitaciones", value: property.bedrooms },
    { icon: Bath, label: "Baños", value: property.bathrooms },
    { icon: Users, label: "Capacidad máxima", value: `${property.max_guests} huéspedes` },
    { icon: Home, label: "Tipo de alojamiento", value: "Casa completa" },
  ];

  return (
    <section id="la-casa" className="py-20 sm:py-28">
      <Container className="grid gap-12 lg:grid-cols-[1.1fr_0.9fr]">
        <div>
          <SectionHeading eyebrow="La casa" title="Un refugio pensado hasta el último detalle" />
          <p className="mt-6 whitespace-pre-line text-base leading-relaxed text-forest-800/80">
            {property.description}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 self-start">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="rounded-2xl border border-sand-200 bg-white p-6 text-forest-800"
            >
              <stat.icon className="h-5 w-5 text-terracotta-600" />
              <p className="mt-4 font-serif text-2xl">{stat.value}</p>
              <p className="mt-1 text-sm text-forest-800/60">{stat.label}</p>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
