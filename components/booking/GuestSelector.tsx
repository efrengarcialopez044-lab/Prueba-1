"use client";

import { Minus, Plus, Users } from "lucide-react";

export function GuestSelector({
  value,
  max,
  onChange,
}: {
  value: number;
  max: number;
  onChange: (value: number) => void;
}) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-sand-300 bg-white px-4 py-2.5">
      <span className="flex items-center gap-2 text-sm text-forest-800">
        <Users className="h-4 w-4 text-terracotta-600" /> Huéspedes
      </span>
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => onChange(Math.max(1, value - 1))}
          disabled={value <= 1}
          className="flex h-7 w-7 items-center justify-center rounded-full border border-sand-300 text-forest-800 disabled:opacity-30"
          aria-label="Menos huéspedes"
        >
          <Minus className="h-3.5 w-3.5" />
        </button>
        <span className="w-4 text-center text-sm font-medium text-forest-800">{value}</span>
        <button
          type="button"
          onClick={() => onChange(Math.min(max, value + 1))}
          disabled={value >= max}
          className="flex h-7 w-7 items-center justify-center rounded-full border border-sand-300 text-forest-800 disabled:opacity-30"
          aria-label="Más huéspedes"
        >
          <Plus className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
