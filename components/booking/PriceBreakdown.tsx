import { formatCurrency, formatDateShort } from "@/lib/utils";
import type { PriceBreakdown as PriceBreakdownType } from "@/lib/types";

export function PriceBreakdown({
  price,
  checkIn,
  checkOut,
}: {
  price: PriceBreakdownType;
  checkIn?: string | null;
  checkOut?: string | null;
}) {
  if (!checkIn || !checkOut || price.nights <= 0) {
    return (
      <p className="text-sm text-forest-800/60">
        Selecciona fecha de entrada y salida para ver el precio total.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-sm text-forest-800/70">
        {formatDateShort(checkIn)} — {formatDateShort(checkOut)} · {price.nights} noche
        {price.nights > 1 ? "s" : ""}
      </p>

      <div className="space-y-2 border-t border-sand-200 pt-3 text-sm">
        <div className="flex justify-between text-forest-800/80">
          <span>
            {formatCurrency(price.pricePerNight)} × {price.nights} noche
            {price.nights > 1 ? "s" : ""}
          </span>
          <span>{formatCurrency(price.subtotal)}</span>
        </div>
        {price.cleaningFee > 0 && (
          <div className="flex justify-between text-forest-800/80">
            <span>Gastos de limpieza</span>
            <span>{formatCurrency(price.cleaningFee)}</span>
          </div>
        )}
      </div>

      <div className="flex justify-between border-t border-sand-200 pt-3 font-serif text-lg text-forest-800">
        <span>Total</span>
        <span>{formatCurrency(price.total)}</span>
      </div>
    </div>
  );
}
