"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input, Label, Textarea } from "@/components/ui/Field";
import type { Property } from "@/lib/types";

export function SettingsForm({ property }: { property: Property }) {
  const router = useRouter();
  const [form, setForm] = useState({
    name: property.name,
    tagline: property.tagline,
    description: property.description,
    address: property.address,
    city: property.city,
    price_per_night: property.price_per_night,
    cleaning_fee: property.cleaning_fee,
    max_guests: property.max_guests,
    bedrooms: property.bedrooms,
    bathrooms: property.bathrooms,
    amenities: property.amenities.join("\n"),
    contact_email: property.contact_email,
    contact_phone: property.contact_phone,
    cancellation_deadline_days: property.cancellation_deadline_days,
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(
    null
  );

  function set<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    const res = await fetch("/api/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        amenities: form.amenities.split("\n").map((a) => a.trim()).filter(Boolean),
      }),
    });
    const data = await res.json();
    setSaving(false);

    if (!res.ok) {
      setMessage({ type: "error", text: data.error ?? "No se pudo guardar" });
      return;
    }
    setMessage({ type: "success", text: "Cambios guardados correctamente." });
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <section className="space-y-4">
        <h2 className="font-serif text-lg text-forest-800">Información general</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="name">Nombre de la casa</Label>
            <Input id="name" value={form.name} onChange={(e) => set("name", e.target.value)} />
          </div>
          <div>
            <Label htmlFor="city">Ciudad / zona</Label>
            <Input id="city" value={form.city} onChange={(e) => set("city", e.target.value)} />
          </div>
        </div>
        <div>
          <Label htmlFor="tagline">Eslogan</Label>
          <Input
            id="tagline"
            value={form.tagline}
            onChange={(e) => set("tagline", e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="address">Dirección</Label>
          <Input
            id="address"
            value={form.address}
            onChange={(e) => set("address", e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="description">Descripción</Label>
          <Textarea
            id="description"
            rows={5}
            value={form.description}
            onChange={(e) => set("description", e.target.value)}
          />
        </div>
      </section>

      <section className="space-y-4 border-t border-sand-200 pt-6">
        <h2 className="font-serif text-lg text-forest-800">Precios y capacidad</h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          <div>
            <Label htmlFor="price">Precio/noche (€)</Label>
            <Input
              id="price"
              type="number"
              min={0}
              value={form.price_per_night}
              onChange={(e) => set("price_per_night", Number(e.target.value))}
            />
          </div>
          <div>
            <Label htmlFor="cleaning">Limpieza (€)</Label>
            <Input
              id="cleaning"
              type="number"
              min={0}
              value={form.cleaning_fee}
              onChange={(e) => set("cleaning_fee", Number(e.target.value))}
            />
          </div>
          <div>
            <Label htmlFor="deadline">Días de cancelación</Label>
            <Input
              id="deadline"
              type="number"
              min={0}
              value={form.cancellation_deadline_days}
              onChange={(e) => set("cancellation_deadline_days", Number(e.target.value))}
            />
          </div>
          <div>
            <Label htmlFor="guests">Capacidad máxima</Label>
            <Input
              id="guests"
              type="number"
              min={1}
              value={form.max_guests}
              onChange={(e) => set("max_guests", Number(e.target.value))}
            />
          </div>
          <div>
            <Label htmlFor="bedrooms">Habitaciones</Label>
            <Input
              id="bedrooms"
              type="number"
              min={0}
              value={form.bedrooms}
              onChange={(e) => set("bedrooms", Number(e.target.value))}
            />
          </div>
          <div>
            <Label htmlFor="bathrooms">Baños</Label>
            <Input
              id="bathrooms"
              type="number"
              min={0}
              value={form.bathrooms}
              onChange={(e) => set("bathrooms", Number(e.target.value))}
            />
          </div>
        </div>
      </section>

      <section className="space-y-4 border-t border-sand-200 pt-6">
        <h2 className="font-serif text-lg text-forest-800">Servicios</h2>
        <Label htmlFor="amenities">Uno por línea</Label>
        <Textarea
          id="amenities"
          rows={6}
          value={form.amenities}
          onChange={(e) => set("amenities", e.target.value)}
        />
      </section>

      <section className="space-y-4 border-t border-sand-200 pt-6">
        <h2 className="font-serif text-lg text-forest-800">Contacto</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="contact_email">Email</Label>
            <Input
              id="contact_email"
              type="email"
              value={form.contact_email}
              onChange={(e) => set("contact_email", e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="contact_phone">Teléfono</Label>
            <Input
              id="contact_phone"
              value={form.contact_phone}
              onChange={(e) => set("contact_phone", e.target.value)}
            />
          </div>
        </div>
      </section>

      {message && (
        <p className={message.type === "success" ? "text-sm text-emerald-700" : "text-sm text-red-600"}>
          {message.text}
        </p>
      )}

      <Button type="submit" disabled={saving}>
        {saving ? "Guardando…" : "Guardar cambios"}
      </Button>
    </form>
  );
}
