import Link from "next/link";
import { ButtonLink } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";

const links = [
  { href: "#galeria", label: "Galería" },
  { href: "#la-casa", label: "La casa" },
  { href: "#disponibilidad", label: "Disponibilidad" },
  { href: "#faq", label: "Preguntas frecuentes" },
  { href: "#contacto", label: "Contacto" },
];

export function Header({ propertyName }: { propertyName: string }) {
  return (
    <header className="sticky top-0 z-40 border-b border-sand-200/80 bg-sand-50/85 backdrop-blur-md">
      <Container className="flex h-18 items-center justify-between py-3">
        <Link href="/" className="font-serif text-xl text-forest-800">
          {propertyName}
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm text-forest-800/70 transition-colors hover:text-forest-800"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <ButtonLink href="/reservar" size="sm">
          Reservar ahora
        </ButtonLink>
      </Container>
    </header>
  );
}
