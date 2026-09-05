"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Trash2, Plus } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input, Label } from "@/components/ui/Field";
import type { PropertyImage } from "@/lib/types";

export function ImagesManager({ images }: { images: PropertyImage[] }) {
  const router = useRouter();
  const [url, setUrl] = useState("");
  const [alt, setAlt] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    const res = await fetch("/api/settings/images", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url, alt }),
    });
    const data = await res.json();
    setSubmitting(false);
    if (!res.ok) {
      setError(data.error ?? "No se pudo añadir la foto");
      return;
    }
    setUrl("");
    setAlt("");
    router.refresh();
  }

  async function handleRemove(id: string) {
    await fetch(`/api/settings/images/${id}`, { method: "DELETE" });
    router.refresh();
  }

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {images.map((img) => (
          <div key={img.id} className="group relative aspect-square overflow-hidden rounded-xl">
            <Image src={img.url} alt={img.alt} fill sizes="200px" className="object-cover" />
            <button
              onClick={() => handleRemove(img.id)}
              className="absolute right-1.5 top-1.5 rounded-full bg-black/50 p-1.5 text-white opacity-0 transition-opacity group-hover:opacity-100"
              aria-label="Eliminar foto"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}
      </div>

      <form onSubmit={handleAdd} className="flex flex-wrap items-end gap-3">
        <div className="flex-1 min-w-[220px]">
          <Label htmlFor="img-url">URL de la foto</Label>
          <Input
            id="img-url"
            type="url"
            required
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://…"
          />
        </div>
        <div className="flex-1 min-w-[160px]">
          <Label htmlFor="img-alt">Descripción</Label>
          <Input
            id="img-alt"
            required
            value={alt}
            onChange={(e) => setAlt(e.target.value)}
            placeholder="Salón con chimenea"
          />
        </div>
        <Button type="submit" disabled={submitting}>
          <Plus className="h-4 w-4" /> Añadir
        </Button>
      </form>
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
