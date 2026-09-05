"use client";

import { useState } from "react";
import Image from "next/image";
import { Expand } from "lucide-react";
import { Container, SectionHeading } from "@/components/ui/Container";
import { Lightbox } from "@/components/ui/Lightbox";
import type { PropertyImage } from "@/lib/types";

export function Gallery({ images }: { images: PropertyImage[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [main, ...rest] = images;

  return (
    <section id="galeria" className="py-20 sm:py-28">
      <Container>
        <SectionHeading
          eyebrow="Galería"
          title="Cada rincón, pensado para desconectar"
          description="Un vistazo a la casa antes de tu llegada."
        />

        <div className="mt-10 grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4 md:grid-rows-2">
          {main && (
            <button
              onClick={() => setOpenIndex(0)}
              className="group relative col-span-2 row-span-2 aspect-[4/3] overflow-hidden rounded-2xl md:aspect-auto"
            >
              <Image
                src={main.url}
                alt={main.alt}
                fill
                sizes="(min-width: 768px) 50vw, 100vw"
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <GalleryHoverIcon />
            </button>
          )}

          {rest.slice(0, 4).map((image, i) => (
            <button
              key={image.id}
              onClick={() => setOpenIndex(i + 1)}
              className="group relative aspect-square overflow-hidden rounded-2xl"
            >
              <Image
                src={image.url}
                alt={image.alt}
                fill
                sizes="(min-width: 768px) 25vw, 50vw"
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
              {i === 3 && rest.length > 4 && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50 font-serif text-lg text-white">
                  +{rest.length - 4} fotos
                </div>
              )}
              <GalleryHoverIcon />
            </button>
          ))}
        </div>
      </Container>

      {openIndex !== null && (
        <Lightbox
          images={images}
          index={openIndex}
          onClose={() => setOpenIndex(null)}
          onIndexChange={setOpenIndex}
        />
      )}
    </section>
  );
}

function GalleryHoverIcon() {
  return (
    <span className="absolute right-3 top-3 rounded-full bg-black/30 p-2 opacity-0 backdrop-blur-sm transition-opacity group-hover:opacity-100">
      <Expand className="h-4 w-4 text-white" />
    </span>
  );
}
