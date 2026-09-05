import Image from "next/image";
import { MapPin, Users, BedDouble, Bath } from "lucide-react";
import { ButtonLink } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { formatCurrency } from "@/lib/utils";
import type { Property, PropertyImage } from "@/lib/types";

export function Hero({ property, heroImage }: { property: Property; heroImage?: PropertyImage }) {
  return (
    <section className="relative flex min-h-[88vh] items-end overflow-hidden">
      {heroImage && (
        <Image
          src={heroImage.url}
          alt={heroImage.alt}
          fill
          priority
          sizes="100vw"
          className="animate-kenburns object-cover"
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/25 to-black/10" />

      <Container className="relative z-10 pb-16 pt-32 text-white">
        <div className="animate-fade-up max-w-2xl">
          <p className="mb-4 flex items-center gap-2 text-sm font-medium text-white/85">
            <MapPin className="h-4 w-4" />
            {property.city}
          </p>
          <h1 className="font-serif text-4xl leading-tight sm:text-6xl">{property.name}</h1>
          <p className="mt-4 text-lg text-white/85 sm:text-xl">{property.tagline}</p>

          <div className="mt-8 flex flex-wrap items-center gap-6 text-sm text-white/90">
            <span className="flex items-center gap-2">
              <BedDouble className="h-4 w-4" /> {property.bedrooms} habitaciones
            </span>
            <span className="flex items-center gap-2">
              <Bath className="h-4 w-4" /> {property.bathrooms} baños
            </span>
            <span className="flex items-center gap-2">
              <Users className="h-4 w-4" /> Hasta {property.max_guests} huéspedes
            </span>
          </div>

          <div className="mt-10 flex flex-wrap items-center gap-5">
            <ButtonLink href="/reservar" size="lg">
              Reservar ahora
            </ButtonLink>
            <p className="text-sm text-white/85">
              Desde{" "}
              <span className="font-serif text-xl text-white">
                {formatCurrency(property.price_per_night)}
              </span>{" "}
              / noche
            </p>
          </div>
        </div>
      </Container>
    </section>
  );
}
