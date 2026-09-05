# Casa Elody

Plataforma de reservas para una única casa vacacional (villa frente al mar en Galicia):
web pública con landing, galería y motor de reservas, más un panel de administración
privado para el propietario.

## Stack

Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS v4 · Supabase (Postgres +
Auth) · Zod · Stripe (preparado, no activado).

## Empezar

```bash
npm install
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000). **No hace falta configurar nada**:
sin variables de entorno, la app arranca en **modo demo**, con datos de ejemplo en
memoria (`lib/mock-data.ts` / `lib/mock-store.ts`) que permiten reservar, confirmar,
cancelar, bloquear fechas y editar la configuración de principio a fin. El panel de
administración es accesible en `/admin` sin login en este modo (se muestra un aviso
"Modo demo" en la cabecera).

## Conectar Supabase (producción)

1. Crea un proyecto en [supabase.com](https://supabase.com).
2. Aplica el esquema: pega el contenido de `supabase/migrations/0001_init.sql` en el
   SQL Editor de Supabase (crea las tablas, las políticas RLS y una fila inicial de
   `properties`).
3. Crea un usuario en **Authentication → Users**: será el propietario/administrador.
   Cualquier usuario autenticado puede gestionar el panel (proyecto de una sola casa).
4. Copia `.env.example` a `.env.local` y rellena:
   - `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` — Project Settings → API.
   - `SUPABASE_SERVICE_ROLE_KEY` — misma pantalla; solo se usa en el servidor.
5. Reinicia el servidor. La app detecta las variables y pasa a usar Supabase para todo
   (lecturas, escrituras y autenticación del panel), incluyendo el `EXCLUDE` constraint
   de PostgreSQL que impide reservas solapadas a nivel de base de datos.

## Emails y pagos

- **Emails** (`lib/email.ts`): sin `RESEND_API_KEY`, cada email se registra en la consola
  del servidor en vez de enviarse. Define `RESEND_API_KEY` y `EMAIL_FROM` para activarlos
  de verdad (u otro proveedor, cambiando la función `send()`).
- **Stripe** (`lib/stripe.ts`): cliente y helper de Checkout Session ya escritos pero sin
  invocar — las reservas se crean como solicitud sin cobro. Ver los comentarios del
  archivo para activar el cobro al reservar.

## Google Calendar

Cada vez que una reserva pasa a `confirmed` se crea un evento de día completo en el
Google Calendar del propietario (nombre del huésped, contacto, huéspedes y notas); al
cancelarla, el evento se elimina. Sin configurar, solo se registra en la consola del
servidor (`lib/google-calendar.ts`). Para activarlo:

1. Crea un proyecto en [Google Cloud Console](https://console.cloud.google.com) y activa
   la **Google Calendar API**.
2. Crea una **cuenta de servicio** (IAM y administración → Cuentas de servicio) y genera
   una clave JSON.
3. En Google Calendar (calendar.google.com), en el calendario del propietario:
   **Configuración → Compartir con determinadas personas** → añade el email de la cuenta
   de servicio (algo como `nombre@proyecto.iam.gserviceaccount.com`) con permiso
   **"Realizar cambios en los eventos"**.
4. Copia a `.env.local`: `GOOGLE_SERVICE_ACCOUNT_EMAIL`, `GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY`
   (el campo `private_key` del JSON, tal cual) y `GOOGLE_CALENDAR_ID` (normalmente el email
   de Gmail del propietario, visible en la configuración de ese calendario).

No requiere que el propietario inicie sesión con Google en la web — es una integración
servidor a servidor.

## Estructura del proyecto

```
app/
  page.tsx                          Landing pública
  reservar/                         Flujo de reserva (calendario, precio, formulario)
  reserva-confirmada/[code]/        Confirmación + cancelación por el huésped
  admin/
    login/                          Login del propietario (o acceso directo en modo demo)
    (panel)/                        Dashboard, reservas, calendario, configuración
  api/                              Route handlers (disponibilidad, reservas, ajustes…)
components/
  landing/  booking/  admin/  ui/   Componentes por área, todos reutilizables
lib/
  db.ts             Capa de datos única: Supabase si está configurado, mock en memoria si no
  bookings.ts       Precio, solapamiento de fechas, política de cancelación (server-side)
  validations.ts    Esquemas Zod para reservas y configuración
  supabase/         Clientes de Supabase (browser, server, admin) + sesión de middleware
supabase/migrations/ Esquema SQL, RLS y seed inicial
```

## Reglas de negocio clave

- **Disponibilidad**: una fecha está ocupada si se solapa con una reserva `pending` o
  `confirmed`, o con un bloqueo manual. Se valida en `lib/bookings.ts` y se repite en el
  backend en cada creación de reserva — nunca se confía en lo que envía el cliente. Con
  Supabase activo, un `EXCLUDE` constraint en Postgres es la última línea de defensa
  ante condiciones de carrera.
- **Precio**: siempre se recalcula en el servidor (`lib/db.ts` → `createBooking`) a partir
  del precio/noche y la limpieza vigentes, ignorando cualquier total que llegue del cliente.
- **Cancelación**: configurable por el propietario (`cancellation_deadline_days`, por
  defecto 7). Un huésped no puede cancelar si faltan menos días para el check-in que ese
  valor — se comprueba en el servidor (`PATCH /api/bookings/:id`) aunque se salte la UI.
  El administrador puede cancelar siempre.

## Comandos

```bash
npm run dev     # desarrollo
npm run build   # build de producción
npm run lint    # ESLint
```
