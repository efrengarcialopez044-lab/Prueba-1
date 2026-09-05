import {
  Waves,
  Wifi,
  Flame,
  ChefHat,
  Car,
  Trees,
  Snowflake,
  Utensils,
  PawPrint,
  Shirt,
  Tv,
  BedDouble,
  Wine,
  Check,
  type LucideIcon,
} from "lucide-react";
import { Container, SectionHeading } from "@/components/ui/Container";

const iconMap: Record<string, LucideIcon> = {
  playa: Waves,
  atlántico: Waves,
  mar: Waves,
  piscina: Waves,
  wifi: Wifi,
  chimenea: Flame,
  calefacción: Flame,
  cocina: ChefHat,
  parking: Car,
  jardín: Trees,
  terraza: Trees,
  aire: Snowflake,
  barbacoa: Utensils,
  mascotas: PawPrint,
  lavadora: Shirt,
  tv: Tv,
  ropa: BedDouble,
  bodega: Wine,
  vino: Wine,
};

function iconFor(label: string): LucideIcon {
  const key = Object.keys(iconMap).find((k) => label.toLowerCase().includes(k));
  return key ? iconMap[key] : Check;
}

export function Amenities({ amenities }: { amenities: string[] }) {
  return (
    <section className="bg-sand-100/60 py-20 sm:py-28">
      <Container>
        <SectionHeading
          eyebrow="Servicios"
          title="Todo lo que necesitas, ya está aquí"
          description="Pensada para estancias largas y para no echar nada de menos."
        />

        <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {amenities.map((amenity) => {
            const Icon = iconFor(amenity);
            return (
              <div
                key={amenity}
                className="flex items-center gap-3 rounded-xl border border-sand-200 bg-white px-4 py-3.5"
              >
                <Icon className="h-5 w-5 shrink-0 text-terracotta-600" />
                <span className="text-sm text-forest-800">{amenity}</span>
              </div>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
