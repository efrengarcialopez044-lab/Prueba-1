import { Input, Label, Select } from "@/components/ui/Field";
import type { DocumentType, Occupant } from "@/lib/types";

export interface LeadGuestLegalData {
  documentType: DocumentType;
  documentNumber: string;
  birthDate: string;
  nationality: string;
  addressStreet: string;
  addressPostalCode: string;
  addressCity: string;
  addressProvince: string;
  addressCountry: string;
}

export function emptyLeadLegalData(): LeadGuestLegalData {
  return {
    documentType: "dni",
    documentNumber: "",
    birthDate: "",
    nationality: "Española",
    addressStreet: "",
    addressPostalCode: "",
    addressCity: "",
    addressProvince: "",
    addressCountry: "España",
  };
}

export function emptyOccupant(): Occupant {
  return {
    firstName: "",
    lastName: "",
    documentType: "dni",
    documentNumber: "",
    birthDate: "",
    nationality: "Española",
  };
}

const documentOptions: { value: DocumentType; label: string }[] = [
  { value: "dni", label: "DNI" },
  { value: "nie", label: "NIE" },
  { value: "pasaporte", label: "Pasaporte" },
];

export function LegalGuestForm({
  lead,
  onLeadChange,
  occupants,
  onOccupantsChange,
}: {
  lead: LeadGuestLegalData;
  onLeadChange: (lead: LeadGuestLegalData) => void;
  occupants: Occupant[];
  onOccupantsChange: (occupants: Occupant[]) => void;
}) {
  function setLead<K extends keyof LeadGuestLegalData>(key: K, value: LeadGuestLegalData[K]) {
    onLeadChange({ ...lead, [key]: value });
  }

  function setOccupant<K extends keyof Occupant>(index: number, key: K, value: Occupant[K]) {
    const next = [...occupants];
    next[index] = { ...next[index], [key]: value };
    onOccupantsChange(next);
  }

  return (
    <div className="space-y-6">
      <div className="rounded-xl bg-sand-100 p-4 text-xs leading-relaxed text-forest-800/70">
        Por normativa española de alojamientos turísticos, necesitamos los datos de identidad y
        domicilio del titular, y la identidad de cada acompañante.
      </div>

      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-forest-800">Documento y domicilio del titular</h3>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="leadDocumentType">Tipo de documento</Label>
            <Select
              id="leadDocumentType"
              value={lead.documentType}
              onChange={(e) => setLead("documentType", e.target.value as DocumentType)}
            >
              {documentOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <Label htmlFor="leadDocumentNumber">Número de documento</Label>
            <Input
              id="leadDocumentNumber"
              required
              value={lead.documentNumber}
              onChange={(e) => setLead("documentNumber", e.target.value)}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="leadBirthDate">Fecha de nacimiento</Label>
            <Input
              id="leadBirthDate"
              type="date"
              required
              value={lead.birthDate}
              onChange={(e) => setLead("birthDate", e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="leadNationality">Nacionalidad</Label>
            <Input
              id="leadNationality"
              required
              value={lead.nationality}
              onChange={(e) => setLead("nationality", e.target.value)}
            />
          </div>
        </div>

        <div>
          <Label htmlFor="addressStreet">Dirección (calle y número)</Label>
          <Input
            id="addressStreet"
            required
            value={lead.addressStreet}
            onChange={(e) => setLead("addressStreet", e.target.value)}
          />
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div>
            <Label htmlFor="addressPostalCode">C.P.</Label>
            <Input
              id="addressPostalCode"
              required
              value={lead.addressPostalCode}
              onChange={(e) => setLead("addressPostalCode", e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="addressCity">Ciudad</Label>
            <Input
              id="addressCity"
              required
              value={lead.addressCity}
              onChange={(e) => setLead("addressCity", e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="addressProvince">Provincia</Label>
            <Input
              id="addressProvince"
              required
              value={lead.addressProvince}
              onChange={(e) => setLead("addressProvince", e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="addressCountry">País</Label>
            <Input
              id="addressCountry"
              required
              value={lead.addressCountry}
              onChange={(e) => setLead("addressCountry", e.target.value)}
            />
          </div>
        </div>
      </div>

      {occupants.length > 0 && (
        <div className="space-y-5 border-t border-sand-200 pt-5">
          <h3 className="text-sm font-semibold text-forest-800">
            Acompañantes ({occupants.length})
          </h3>

          {occupants.map((occupant, i) => (
            <div key={i} className="space-y-3 rounded-xl border border-sand-200 p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-forest-800/50">
                Acompañante {i + 1}
              </p>
              <div className="grid grid-cols-2 gap-3">
                <Input
                  placeholder="Nombre"
                  required
                  value={occupant.firstName}
                  onChange={(e) => setOccupant(i, "firstName", e.target.value)}
                />
                <Input
                  placeholder="Apellidos"
                  required
                  value={occupant.lastName}
                  onChange={(e) => setOccupant(i, "lastName", e.target.value)}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Select
                  value={occupant.documentType}
                  onChange={(e) =>
                    setOccupant(i, "documentType", e.target.value as DocumentType)
                  }
                >
                  {documentOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </Select>
                <Input
                  placeholder="Núm. de documento"
                  required
                  value={occupant.documentNumber}
                  onChange={(e) => setOccupant(i, "documentNumber", e.target.value)}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Input
                  type="date"
                  required
                  value={occupant.birthDate}
                  onChange={(e) => setOccupant(i, "birthDate", e.target.value)}
                />
                <Input
                  placeholder="Nacionalidad"
                  required
                  value={occupant.nationality}
                  onChange={(e) => setOccupant(i, "nationality", e.target.value)}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
