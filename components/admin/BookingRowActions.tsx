"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check, X, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import type { BookingStatus } from "@/lib/types";

export function BookingRowActions({
  bookingId,
  status,
  compact = false,
}: {
  bookingId: string;
  status: BookingStatus;
  compact?: boolean;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  async function updateStatus(newStatus: BookingStatus) {
    setError(null);
    const res = await fetch(`/api/bookings/${bookingId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? "No se pudo actualizar");
      return;
    }
    startTransition(() => router.refresh());
  }

  async function handleDelete() {
    const res = await fetch(`/api/bookings/${bookingId}`, { method: "DELETE" });
    if (!res.ok) {
      setError("No se pudo eliminar");
      return;
    }
    startTransition(() => router.refresh());
  }

  return (
    <div className="flex flex-col items-end gap-1.5">
      <div className="flex items-center gap-1.5">
        {status !== "confirmed" && (
          <button
            title="Confirmar"
            onClick={() => updateStatus("confirmed")}
            disabled={isPending}
            className="rounded-full bg-emerald-50 p-2 text-emerald-700 hover:bg-emerald-100 disabled:opacity-50"
          >
            <Check className="h-3.5 w-3.5" />
          </button>
        )}
        {status !== "cancelled" && (
          <button
            title="Cancelar"
            onClick={() => updateStatus("cancelled")}
            disabled={isPending}
            className="rounded-full bg-amber-50 p-2 text-amber-700 hover:bg-amber-100 disabled:opacity-50"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
        {!confirmingDelete ? (
          <button
            title="Eliminar"
            onClick={() => setConfirmingDelete(true)}
            disabled={isPending}
            className="rounded-full bg-red-50 p-2 text-red-700 hover:bg-red-100 disabled:opacity-50"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        ) : (
          <div className="flex items-center gap-1">
            <Button size="sm" variant="outline" onClick={() => setConfirmingDelete(false)}>
              No
            </Button>
            <Button
              size="sm"
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Eliminar
            </Button>
          </div>
        )}
      </div>
      {error && !compact && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}
