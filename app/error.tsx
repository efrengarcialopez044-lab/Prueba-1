"use client";

import { useEffect } from "react";
import { RotateCw, Home } from "lucide-react";
import { ButtonLink, Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error("Error de página no controlado:", error);
  }, [error]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-sand-50 px-4">
      <Container className="max-w-lg text-center">
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-terracotta-600">
          Algo ha fallado
        </p>
        <h1 className="mb-4 font-serif text-4xl text-forest-800">
          Ha ocurrido un error inesperado
        </h1>
        <p className="mb-8 text-forest-800/70">
          Inténtalo de nuevo en unos segundos. Si el problema persiste, contacta con
          nosotros indicando qué estabas haciendo.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <Button onClick={reset}>
            <RotateCw className="h-4 w-4" /> Reintentar
          </Button>
          <ButtonLink href="/" variant="outline">
            <Home className="h-4 w-4" /> Volver al inicio
          </ButtonLink>
        </div>
      </Container>
    </main>
  );
}
