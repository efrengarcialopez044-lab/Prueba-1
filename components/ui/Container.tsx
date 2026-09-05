import { cn } from "@/lib/utils";
import type { ComponentProps } from "react";

export function Container({ className, ...props }: ComponentProps<"div">) {
  return <div className={cn("mx-auto w-full max-w-6xl px-5 sm:px-8", className)} {...props} />;
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  className,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  className?: string;
}) {
  return (
    <div className={cn("max-w-2xl", className)}>
      {eyebrow && (
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-terracotta-600">
          {eyebrow}
        </p>
      )}
      <h2 className="font-serif text-3xl text-forest-800 sm:text-4xl">{title}</h2>
      {description && <p className="mt-3 text-base text-forest-800/70">{description}</p>}
    </div>
  );
}
