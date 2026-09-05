import { Mail, Phone } from "lucide-react";
import { Container, SectionHeading } from "@/components/ui/Container";
import { ButtonLink } from "@/components/ui/Button";
import type { Property } from "@/lib/types";

export function Contact({ property }: { property: Property }) {
  return (
    <section id="contacto" className="bg-forest-800 py-20 text-white sm:py-28">
      <Container className="flex flex-col items-start gap-10 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <SectionHeading
            eyebrow="Contacto"
            title="¿Tienes dudas antes de reservar?"
            description="Escríbenos o llámanos, respondemos en menos de 24 horas."
            className="[&_h2]:text-white [&_p]:text-white/70"
          />
        </div>

        <div className="flex flex-col gap-4">
          <a
            href={`mailto:${property.contact_email}`}
            className="flex items-center gap-3 text-white/90 hover:text-white"
          >
            <Mail className="h-4 w-4" /> {property.contact_email}
          </a>
          <a
            href={`tel:${property.contact_phone.replace(/\s+/g, "")}`}
            className="flex items-center gap-3 text-white/90 hover:text-white"
          >
            <Phone className="h-4 w-4" /> {property.contact_phone}
          </a>
          <ButtonLink href="/reservar" variant="primary" className="mt-2 justify-center">
            Reservar ahora
          </ButtonLink>
        </div>
      </Container>
    </section>
  );
}
