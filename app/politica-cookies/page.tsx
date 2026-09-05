import type { Metadata } from "next";
import { getProperty } from "@/lib/db";
import { Header } from "@/components/landing/Header";
import { Footer } from "@/components/landing/Footer";
import { Container } from "@/components/ui/Container";

export const metadata: Metadata = { title: "Política de cookies — Casa Elody" };

export default async function CookiePolicyPage() {
  const property = await getProperty();

  return (
    <>
      <Header propertyName={property.name} />
      <main className="py-16 sm:py-20">
        <Container className="max-w-3xl">
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-terracotta-600">
            Legal
          </p>
          <h1 className="mb-8 font-serif text-3xl text-forest-800 sm:text-4xl">
            Política de cookies
          </h1>

          <div className="space-y-8 text-sm leading-relaxed text-forest-800/80">
            <section>
              <h2 className="mb-2 font-serif text-xl text-forest-800">¿Qué son las cookies?</h2>
              <p>
                Son pequeños archivos que un sitio web guarda en tu navegador para recordar
                información entre visitas o durante tu sesión. Esta página explica qué cookies
                usa {property.name} y para qué.
              </p>
            </section>

            <section>
              <h2 className="mb-2 font-serif text-xl text-forest-800">
                Cookies técnicas (siempre activas)
              </h2>
              <p className="mb-3">
                Necesarias para que la web funcione y no requieren tu consentimiento:
              </p>
              <ul className="list-disc space-y-1.5 pl-5">
                <li>Sesión de acceso del propietario al panel de administración (<code>/admin</code>).</li>
                <li>Tu elección sobre esta política de cookies (aceptar/rechazar).</li>
                <li>
                  Si reservas, cookies necesarias para completar el pago de forma segura a
                  través de nuestra pasarela de pago.
                </li>
              </ul>
            </section>

            <section>
              <h2 className="mb-2 font-serif text-xl text-forest-800">
                Cookies de analítica (solo con tu consentimiento)
              </h2>
              <p>
                Si las aceptas, usamos Google Analytics para entender de forma anónima y
                agregada cómo se visita la web (páginas más vistas, dispositivo, procedencia)
                y así poder mejorarla. No se activa ninguna cookie de este tipo hasta que
                pulsas &quot;Aceptar&quot; en el aviso de cookies.
              </p>
            </section>

            <section>
              <h2 className="mb-2 font-serif text-xl text-forest-800">Gestionar tu elección</h2>
              <p>
                Puedes cambiar de opinión en cualquier momento borrando los datos de este sitio
                desde la configuración de tu navegador; la próxima vez que visites la web
                volverá a mostrarte el aviso de cookies.
              </p>
            </section>

            <section>
              <h2 className="mb-2 font-serif text-xl text-forest-800">Contacto</h2>
              <p>
                Para cualquier duda sobre esta política, escríbenos a{" "}
                <a href={`mailto:${property.contact_email}`} className="underline">
                  {property.contact_email}
                </a>
                .
              </p>
            </section>
          </div>
        </Container>
      </main>
      <Footer property={property} />
    </>
  );
}
