import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import type { ComponentProps } from "react";

const badgeVariants = cva("inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium", {
  variants: {
    variant: {
      pending: "bg-amber-100 text-amber-800",
      confirmed: "bg-emerald-100 text-emerald-800",
      cancelled: "bg-red-100 text-red-700",
      neutral: "bg-sand-200 text-forest-800",
    },
  },
  defaultVariants: { variant: "neutral" },
});

type BadgeProps = ComponentProps<"span"> & VariantProps<typeof badgeVariants>;

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}

const statusLabels: Record<string, string> = {
  pending: "Pendiente",
  confirmed: "Confirmada",
  cancelled: "Cancelada",
};

export function BookingStatusBadge({ status }: { status: "pending" | "confirmed" | "cancelled" }) {
  return <Badge variant={status}>{statusLabels[status]}</Badge>;
}
