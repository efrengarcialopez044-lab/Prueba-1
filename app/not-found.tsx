import { Home, Search } from "lucide-react";
import { ButtonLink } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-sand-50 px-4">
      <Container className="max-w-lg text-center">
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-terracotta-600">
          Error 404
        </p>
        <h1 className="mb-4 font-serif text-4xl text-forest-800">Esta página no existe</h1>
        <p className="mb-8 text-forest-800/70">
          Puede que el enlace esté mal escrito o que la página se haya movido. Vuelve al
          inicio o consulta la disponibilidad para reservar tu estancia.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <ButtonLink href="/">
            <Home className="h-4 w-4" /> Volver al inicio
          </ButtonLink>
          <ButtonLink href="/reservar" variant="outline">
            <Search className="h-4 w-4" /> Ver disponibilidad
          </ButtonLink>
        </div>
      </Container>
    </main>
  );
}
