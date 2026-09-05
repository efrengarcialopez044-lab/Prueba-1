import { cn } from "@/lib/utils";
import type { ComponentProps, ReactNode } from "react";

export function Label({ className, ...props }: ComponentProps<"label">) {
  return (
    <label
      className={cn("mb-1.5 block text-sm font-medium text-forest-800", className)}
      {...props}
    />
  );
}

export function Input({ className, ...props }: ComponentProps<"input">) {
  return (
    <input
      className={cn(
        "h-11 w-full rounded-xl border border-sand-300 bg-white px-4 text-sm text-forest-800 placeholder:text-forest-800/40 outline-none transition-colors focus:border-forest-600 focus:ring-1 focus:ring-forest-600",
        className
      )}
      {...props}
    />
  );
}

export function Textarea({ className, ...props }: ComponentProps<"textarea">) {
  return (
    <textarea
      className={cn(
        "w-full rounded-xl border border-sand-300 bg-white px-4 py-3 text-sm text-forest-800 placeholder:text-forest-800/40 outline-none transition-colors focus:border-forest-600 focus:ring-1 focus:ring-forest-600",
        className
      )}
      {...props}
    />
  );
}

export function Select({ className, ...props }: ComponentProps<"select">) {
  return (
    <select
      className={cn(
        "h-11 w-full rounded-xl border border-sand-300 bg-white px-4 text-sm text-forest-800 outline-none transition-colors focus:border-forest-600 focus:ring-1 focus:ring-forest-600",
        className
      )}
      {...props}
    />
  );
}

export function FieldError({ children }: { children?: ReactNode }) {
  if (!children) return null;
  return <p className="mt-1 text-xs text-red-600">{children}</p>;
}
