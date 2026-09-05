import { z } from "zod";

const isoDate = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Formato de fecha inválido");

const bookingFieldsSchema = z.object({
  checkIn: isoDate,
  checkOut: isoDate,
  guests: z.coerce.number().int().min(1, "Selecciona al menos 1 huésped"),
  firstName: z.string().trim().min(2, "Introduce tu nombre"),
  lastName: z.string().trim().min(2, "Introduce tus apellidos"),
  email: z.string().trim().email("Introduce un email válido"),
  phone: z.string().trim().min(6, "Introduce un teléfono válido"),
  notes: z.string().trim().max(1000).optional().default(""),
});

const dateOrderRefinement = <T extends { checkIn: string; checkOut: string }>(data: T) =>
  data.checkOut > data.checkIn;

const documentTypeEnum = z.enum(["dni", "nie", "pasaporte"]);

const occupantSchema = z.object({
  firstName: z.string().trim().min(1, "Introduce el nombre"),
  lastName: z.string().trim().min(1, "Introduce los apellidos"),
  documentType: documentTypeEnum,
  documentNumber: z.string().trim().min(5, "Documento inválido"),
  birthDate: isoDate,
  nationality: z.string().trim().min(2, "Introduce la nacionalidad"),
});

// Exigido por la normativa española de registro de viajeros (RD 933/2021)
// para alojamientos turísticos: identidad y domicilio del titular, e
// identidad de cada acompañante.
const legalFieldsSchema = z.object({
  leadDocumentType: documentTypeEnum,
  leadDocumentNumber: z.string().trim().min(5, "Documento inválido"),
  leadBirthDate: isoDate,
  leadNationality: z.string().trim().min(2, "Introduce la nacionalidad"),
  addressStreet: z.string().trim().min(3, "Introduce la dirección"),
  addressPostalCode: z.string().trim().min(3, "Código postal inválido"),
  addressCity: z.string().trim().min(2, "Introduce la ciudad"),
  addressProvince: z.string().trim().min(2, "Introduce la provincia"),
  addressCountry: z.string().trim().min(2, "Introduce el país"),
  occupants: z.array(occupantSchema).default([]),
});

export type LegalFieldsInput = z.infer<typeof legalFieldsSchema>;

export const createBookingSchema = bookingFieldsSchema
  .merge(legalFieldsSchema)
  .extend({
    acceptedTerms: z.literal(true, {
      error: "Debes aceptar los términos y condiciones",
    }),
  })
  .refine(dateOrderRefinement, {
    message: "La fecha de salida debe ser posterior a la de entrada",
    path: ["checkOut"],
  })
  .refine((data) => data.occupants.length === data.guests - 1, {
    message: "Faltan los datos de algún acompañante",
    path: ["occupants"],
  });

export type CreateBookingInput = z.infer<typeof createBookingSchema>;
export type BookingFieldsInput = z.infer<typeof bookingFieldsSchema>;

export const updateBookingStatusSchema = z.object({
  status: z.enum(["pending", "confirmed", "cancelled"]),
});

export const manualBookingSchema = bookingFieldsSchema
  .extend({
    status: z.enum(["pending", "confirmed"]).default("confirmed"),
  })
  .refine(dateOrderRefinement, {
    message: "La fecha de salida debe ser posterior a la de entrada",
    path: ["checkOut"],
  });

export const blockDatesSchema = z
  .object({
    startDate: isoDate,
    endDate: isoDate,
    reason: z.string().trim().max(200).optional().default(""),
  })
  .refine((data) => data.endDate > data.startDate, {
    message: "La fecha final debe ser posterior a la inicial",
    path: ["endDate"],
  });

export const propertySettingsSchema = z.object({
  name: z.string().trim().min(2),
  tagline: z.string().trim().min(2).max(160),
  description: z.string().trim().min(10),
  address: z.string().trim().min(3),
  city: z.string().trim().min(2),
  price_per_night: z.coerce.number().positive(),
  cleaning_fee: z.coerce.number().min(0),
  max_guests: z.coerce.number().int().positive(),
  bedrooms: z.coerce.number().int().min(0),
  bathrooms: z.coerce.number().int().min(0),
  amenities: z.array(z.string().trim().min(1)),
  contact_email: z.string().trim().email(),
  contact_phone: z.string().trim().min(6),
  cancellation_deadline_days: z.coerce.number().int().min(0),
});

export type PropertySettingsInput = z.infer<typeof propertySettingsSchema>;
