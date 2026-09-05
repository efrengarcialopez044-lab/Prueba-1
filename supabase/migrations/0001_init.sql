-- Casa Elody — schema inicial
-- Aplica con: supabase db push  (o pegar en el SQL editor de Supabase)

create extension if not exists "btree_gist";
create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- properties: fila única con la configuración de la casa
-- ---------------------------------------------------------------------------
create table if not exists public.properties (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  tagline text not null default '',
  description text not null default '',
  address text not null default '',
  city text not null default '',
  lat double precision,
  lng double precision,
  price_per_night numeric(10, 2) not null default 0,
  cleaning_fee numeric(10, 2) not null default 0,
  max_guests integer not null default 1,
  bedrooms integer not null default 0,
  bathrooms integer not null default 0,
  amenities text[] not null default '{}',
  contact_email text not null default '',
  contact_phone text not null default '',
  cancellation_deadline_days integer not null default 7,
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- property_images
-- ---------------------------------------------------------------------------
create table if not exists public.property_images (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references public.properties (id) on delete cascade,
  url text not null,
  alt text not null default '',
  sort_order integer not null default 0
);

-- ---------------------------------------------------------------------------
-- blocked_dates: rangos bloqueados manualmente por el propietario
-- ---------------------------------------------------------------------------
create table if not exists public.blocked_dates (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references public.properties (id) on delete cascade,
  start_date date not null,
  end_date date not null,
  reason text,
  constraint blocked_dates_valid_range check (end_date > start_date)
);

-- ---------------------------------------------------------------------------
-- bookings
-- ---------------------------------------------------------------------------
create table if not exists public.bookings (
  id uuid primary key default gen_random_uuid(),
  booking_code text not null unique,
  property_id uuid not null references public.properties (id) on delete cascade,
  user_id uuid references auth.users (id) on delete set null,
  guest_name text not null,
  guest_last_name text not null,
  guest_email text not null,
  guest_phone text not null,
  check_in date not null,
  check_out date not null,
  guests integer not null,
  nights integer not null,
  price_per_night numeric(10, 2) not null,
  cleaning_fee numeric(10, 2) not null default 0,
  total_price numeric(10, 2) not null,
  status text not null default 'pending' check (status in ('pending', 'confirmed', 'cancelled')),
  notes text,
  created_at timestamptz not null default now(),
  constraint bookings_valid_range check (check_out > check_in),
  -- Evita solapamientos entre reservas activas (pending/confirmed) de la
  -- misma propiedad a nivel de base de datos, como última línea de defensa
  -- además de la validación en la API.
  constraint bookings_no_overlap exclude using gist (
    property_id with =,
    daterange(check_in, check_out) with &&
  ) where (status <> 'cancelled')
);

create index if not exists bookings_property_id_idx on public.bookings (property_id);
create index if not exists bookings_status_idx on public.bookings (status);
create index if not exists blocked_dates_property_id_idx on public.blocked_dates (property_id);

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------
alter table public.properties enable row level security;
alter table public.property_images enable row level security;
alter table public.blocked_dates enable row level security;
alter table public.bookings enable row level security;

-- Lectura pública: la web necesita mostrar la casa, sus fotos y qué fechas
-- están bloqueadas (sin exponer datos de huéspedes).
create policy "properties are publicly readable"
  on public.properties for select
  using (true);

create policy "property images are publicly readable"
  on public.property_images for select
  using (true);

create policy "blocked dates are publicly readable"
  on public.blocked_dates for select
  using (true);

-- Solo administradores autenticados pueden modificar la configuración,
-- las fotos y las fechas bloqueadas. En este proyecto de una sola casa,
-- cualquier usuario autenticado es el propietario/administrador.
create policy "admins manage properties"
  on public.properties for update
  using (auth.role() = 'authenticated');

create policy "admins manage property images"
  on public.property_images for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

create policy "admins manage blocked dates"
  on public.blocked_dates for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

-- bookings: contienen datos personales del huésped, así que solo el
-- administrador puede leerlas o modificarlas directamente. La creación
-- pública de reservas se hace a través del backend (API routes) usando la
-- service role key, nunca con el cliente anónimo directo a la tabla.
create policy "admins read bookings"
  on public.bookings for select
  using (auth.role() = 'authenticated');

create policy "admins update bookings"
  on public.bookings for update
  using (auth.role() = 'authenticated');

create policy "admins delete bookings"
  on public.bookings for delete
  using (auth.role() = 'authenticated');

-- ---------------------------------------------------------------------------
-- Seed: una única propiedad de ejemplo (edítala desde /admin/configuracion)
-- ---------------------------------------------------------------------------
insert into public.properties (
  name, tagline, description, address, city, lat, lng,
  price_per_night, cleaning_fee, max_guests, bedrooms, bathrooms,
  amenities, contact_email, contact_phone, cancellation_deadline_days
)
select
  'Casa Elody',
  'Donde el Atlántico se convierte en tu hogar',
  'Casa Elody es una villa privada frente al mar en Ribadeo, a apenas unos minutos de la Playa de las Catedrales, playa protegida y declarada Monumento Natural.',
  'Camiño do Faro, 8',
  'Ribadeo, Lugo',
  43.552, -7.212,
  180, 50, 8, 4, 3,
  array['A 5 min de la Playa de las Catedrales', 'Terraza con vistas al Atlántico', 'Wi-Fi de alta velocidad', 'Chimenea', 'Cocina totalmente equipada', 'Parking privado', 'Jardín privado', 'Bodega de vinos gallegos', 'Se admiten mascotas'],
  'hola@casaelody.com',
  '+34 600 123 456',
  7
where not exists (select 1 from public.properties);
