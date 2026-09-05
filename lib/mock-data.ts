import type { BlockedDate, Booking, FaqItem, Property, PropertyImage } from "./types";

export const MOCK_PROPERTY_ID = "00000000-0000-0000-0000-000000000001";

export const mockProperty: Property = {
  id: MOCK_PROPERTY_ID,
  name: "Casa Elody",
  tagline: "Donde el Atlántico se convierte en tu hogar",
  description:
    "Casa Elody es una villa privada frente al mar en Ribadeo, a apenas unos minutos de la Playa de las Catedrales, playa protegida y declarada Monumento Natural por sus formaciones rocosas únicas en el mundo. Grandes ventanales abiertos al Atlántico, terraza exterior con vistas ininterrumpidas y un jardín privado hasta el acantilado hacen de esta casa un refugio pensado para desconectar. Dentro, espacios luminosos y una cocina completa invitan a alargar las sobremesas con los productos y vinos de la tierra; fuera, el sonido del mar marca el ritmo de los días. El punto de partida perfecto para descubrir la gastronomía y los paisajes de Galicia.",
  address: "Camiño do Faro, 8",
  city: "Ribadeo, Lugo",
  lat: 43.552,
  lng: -7.212,
  price_per_night: 180,
  cleaning_fee: 50,
  max_guests: 18,
  bedrooms: 9,
  bathrooms: 6,
  amenities: [
    "A 5 min de la Playa de las Catedrales",
    "Terraza con vistas al Atlántico",
    "Wi-Fi de alta velocidad",
    "Chimenea",
    "Cocina totalmente equipada",
    "Parking privado",
    "Jardín privado",
    "Calefacción",
    "Bodega de vinos gallegos",
    "Se admiten mascotas",
    "Ropa de cama y toallas incluidas",
    "Lavadora y secadora",
    "Smart TV",
  ],
  contact_email: "hola@casaelody.com",
  contact_phone: "+34 600 123 456",
  cancellation_deadline_days: 7,
  updated_at: new Date().toISOString(),
};

// Fotos reales de la casa en Ribadeo. Son las que pasó el cliente — llevan
// marca de agua de la inmobiliaria que las tomó originalmente y algunas son
// de baja resolución (subidas desde un anuncio, no los archivos originales).
// Sustituir por los archivos originales sin marca de agua en cuanto estén
// disponibles, sobre todo para la foto principal del hero.
export const mockImages: PropertyImage[] = [
  {
    id: "img-1",
    property_id: MOCK_PROPERTY_ID,
    url: "/property/ribadeo-1-aerial.png",
    alt: "Vista aérea de la casa sobre el acantilado",
    sort_order: 0,
  },
  {
    id: "img-2",
    property_id: MOCK_PROPERTY_ID,
    url: "/property/ribadeo-6-driveway.jpg",
    alt: "Fachada principal y entrada de la casa",
    sort_order: 1,
  },
  {
    id: "img-3",
    property_id: MOCK_PROPERTY_ID,
    url: "/property/ribadeo-5-terrace.jpg",
    alt: "Terraza cubierta con vistas al mar",
    sort_order: 2,
  },
  {
    id: "img-4",
    property_id: MOCK_PROPERTY_ID,
    url: "/property/ribadeo-3-garden.webp",
    alt: "Jardín y césped frente a la casa",
    sort_order: 3,
  },
  {
    id: "img-5",
    property_id: MOCK_PROPERTY_ID,
    url: "/property/ribadeo-4-front.jpg",
    alt: "Vista lateral de la casa",
    sort_order: 4,
  },
  {
    id: "img-6",
    property_id: MOCK_PROPERTY_ID,
    url: "/property/ribadeo-2-aerial-bay.jpg",
    alt: "Vista aérea de la casa y la bahía",
    sort_order: 5,
  },
];

function daysFromNow(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
}

export const mockBookings: Booking[] = [
  {
    id: "bk-1",
    booking_code: "CE-84213",
    property_id: MOCK_PROPERTY_ID,
    user_id: null,
    guest_name: "Laura",
    guest_last_name: "Martínez",
    guest_email: "laura.martinez@example.com",
    guest_phone: "+34 611 222 333",
    check_in: daysFromNow(10),
    check_out: daysFromNow(14),
    guests: 4,
    nights: 4,
    price_per_night: 145,
    cleaning_fee: 45,
    total_price: 145 * 4 + 45,
    status: "confirmed",
    notes: null,
    lead_document_type: null,
    lead_document_number: null,
    lead_birth_date: null,
    lead_nationality: null,
    address_street: null,
    address_postal_code: null,
    address_city: null,
    address_province: null,
    address_country: null,
    occupants: [],
    google_event_id: null,
    stripe_session_id: "cs_test_demo_1",
    stripe_payment_intent_id: "pi_demo_1",
    paid_at: new Date(Date.now() - 86400000 * 5).toISOString(),
    created_at: new Date(Date.now() - 86400000 * 5).toISOString(),
  },
  {
    id: "bk-2",
    booking_code: "CE-91027",
    property_id: MOCK_PROPERTY_ID,
    user_id: null,
    guest_name: "Carlos",
    guest_last_name: "Ibáñez",
    guest_email: "carlos.ibanez@example.com",
    guest_phone: "+34 622 333 444",
    check_in: daysFromNow(25),
    check_out: daysFromNow(28),
    guests: 2,
    nights: 3,
    price_per_night: 145,
    cleaning_fee: 45,
    total_price: 145 * 3 + 45,
    status: "pending",
    notes: "Llegaremos por la tarde, sobre las 19h.",
    lead_document_type: null,
    lead_document_number: null,
    lead_birth_date: null,
    lead_nationality: null,
    address_street: null,
    address_postal_code: null,
    address_city: null,
    address_province: null,
    address_country: null,
    occupants: [],
    google_event_id: null,
    stripe_session_id: null,
    stripe_payment_intent_id: null,
    paid_at: null,
    created_at: new Date(Date.now() - 86400000 * 1).toISOString(),
  },
  {
    id: "bk-3",
    booking_code: "CE-77410",
    property_id: MOCK_PROPERTY_ID,
    user_id: null,
    guest_name: "Ana",
    guest_last_name: "Ruiz",
    guest_email: "ana.ruiz@example.com",
    guest_phone: "+34 633 444 555",
    check_in: daysFromNow(-20),
    check_out: daysFromNow(-16),
    guests: 6,
    nights: 4,
    price_per_night: 130,
    cleaning_fee: 45,
    total_price: 130 * 4 + 45,
    status: "confirmed",
    notes: null,
    lead_document_type: null,
    lead_document_number: null,
    lead_birth_date: null,
    lead_nationality: null,
    address_street: null,
    address_postal_code: null,
    address_city: null,
    address_province: null,
    address_country: null,
    occupants: [],
    google_event_id: null,
    stripe_session_id: null,
    stripe_payment_intent_id: null,
    paid_at: null,
    created_at: new Date(Date.now() - 86400000 * 30).toISOString(),
  },
];

export const mockBlockedDates: BlockedDate[] = [
  {
    id: "blk-1",
    property_id: MOCK_PROPERTY_ID,
    start_date: daysFromNow(40),
    end_date: daysFromNow(45),
    reason: "Mantenimiento anual de la casa",
  },
];

export const mockFaqs: FaqItem[] = [
  {
    question: "¿A qué hora son el check-in y el check-out?",
    answer:
      "El check-in es a partir de las 16:00 y el check-out hasta las 11:00. Si necesitas horarios especiales, coméntalo en el formulario de reserva.",
  },
  {
    question: "¿Se admiten mascotas?",
    answer:
      "Sí, admitimos mascotas sin coste adicional. Te pedimos que las mantengas fuera de las camas y del sofá.",
  },
  {
    question: "¿Cuál es la política de cancelación?",
    answer:
      "Puedes cancelar tu reserva sin coste hasta 7 días antes de la fecha de entrada. Pasado ese plazo, la reserva no podrá cancelarse desde tu área de cliente.",
  },
  {
    question: "¿Hay un número mínimo de noches?",
    answer:
      "Generalmente pedimos un mínimo de 2 noches, salvo en temporada alta donde puede ampliarse a 3 o 4 noches.",
  },
  {
    question: "¿Cómo se confirma la reserva?",
    answer:
      "Al enviar el formulario se crea una solicitud. El propietario la revisará y te confirmará por email en un plazo máximo de 24 horas.",
  },
];
