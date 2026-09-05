"use client";

import { useCallback, useEffect } from "react";
import Image from "next/image";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import type { PropertyImage } from "@/lib/types";

export function Lightbox({
  images,
  index,
  onClose,
  onIndexChange,
}: {
  images: PropertyImage[];
  index: number;
  onClose: () => void;
  onIndexChange: (index: number) => void;
}) {
  const goPrev = useCallback(
    () => onIndexChange((index - 1 + images.length) % images.length),
    [index, images.length, onIndexChange]
  );
  const goNext = useCallback(
    () => onIndexChange((index + 1) % images.length),
    [index, images.length, onIndexChange]
  );

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") goPrev();
      if (e.key === "ArrowRight") goNext();
    }
    window.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [onClose, goPrev, goNext]);

  const image = images[index];
  if (!image) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col bg-black/95 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label="Galería de fotografías"
    >
      <button
        onClick={onClose}
        className="absolute right-4 top-4 z-10 rounded-full bg-white/10 p-2.5 text-white hover:bg-white/20"
        aria-label="Cerrar galería"
      >
        <X className="h-5 w-5" />
      </button>

      <div className="relative flex flex-1 items-center justify-center px-4">
        <button
          onClick={goPrev}
          className="absolute left-2 z-10 rounded-full bg-white/10 p-2.5 text-white hover:bg-white/20 sm:left-6"
          aria-label="Foto anterior"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>

        <div className="relative h-[70vh] w-full max-w-5xl">
          <Image
            src={image.url}
            alt={image.alt}
            fill
            sizes="100vw"
            className="object-contain"
            priority
          />
        </div>

        <button
          onClick={goNext}
          className="absolute right-2 z-10 rounded-full bg-white/10 p-2.5 text-white hover:bg-white/20 sm:right-6"
          aria-label="Foto siguiente"
        >
          <ChevronRight className="h-6 w-6" />
        </button>
      </div>

      <p className="pb-6 text-center text-sm text-white/70">
        {index + 1} / {images.length} — {image.alt}
      </p>
    </div>
  );
}
