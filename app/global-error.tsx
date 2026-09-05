"use client";

import { useEffect } from "react";

/**
 * Catches errors thrown by the root layout itself. Kept deliberately
 * dependency-free (inline styles, no shared components) since if the root
 * layout crashed, we can't safely assume anything it provides still works.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Error crítico en el layout raíz:", error);
  }, [error]);

  return (
    <html lang="es">
      <body
        style={{
          display: "flex",
          minHeight: "100vh",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "system-ui, sans-serif",
          background: "#f8fafb",
          color: "#16292e",
          padding: "1.5rem",
        }}
      >
        <div style={{ maxWidth: "28rem", textAlign: "center" }}>
          <h1 style={{ fontSize: "1.5rem", marginBottom: "1rem" }}>
            Ha ocurrido un error inesperado
          </h1>
          <p style={{ marginBottom: "1.5rem", opacity: 0.8 }}>
            Por favor, recarga la página. Si el problema persiste, contáctanos.
          </p>
          <button
            onClick={reset}
            style={{
              background: "#e8825a",
              color: "white",
              border: "none",
              borderRadius: "9999px",
              padding: "0.65rem 1.5rem",
              cursor: "pointer",
              fontSize: "0.9rem",
            }}
          >
            Reintentar
          </button>
        </div>
      </body>
    </html>
  );
}
