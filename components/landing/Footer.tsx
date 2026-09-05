import Link from "next/link";
import { Container } from "@/components/ui/Container";
import type { Property } from "@/lib/types";

export function Footer({ property }: { property: Property }) {
  return (
    <footer className="border-t border-sand-200 bg-sand-50 py-10">
      <Container className="flex flex-col items-center gap-4 text-center text-sm text-forest-800/60 sm:flex-row sm:justify-between sm:text-left">
        <p>
          © {new Date().getFullYear()} {property.name}. Todos los derechos reservados.
        </p>
        <Link href="/admin" className="hover:text-forest-800">
          Acceso propietario
        </Link>
      </Container>
    </footer>
  );
}
