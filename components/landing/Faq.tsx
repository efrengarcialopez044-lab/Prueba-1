"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { Container, SectionHeading } from "@/components/ui/Container";
import type { FaqItem } from "@/lib/types";

export function Faq({ faqs }: { faqs: FaqItem[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section id="faq" className="py-20 sm:py-28">
      <Container className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr]">
        <SectionHeading eyebrow="Preguntas frecuentes" title="Todo lo que debes saber" />

        <div className="divide-y divide-sand-200 border-t border-sand-200">
          {faqs.map((faq, i) => {
            const open = openIndex === i;
            return (
              <div key={faq.question}>
                <button
                  onClick={() => setOpenIndex(open ? null : i)}
                  className="flex w-full items-center justify-between gap-4 py-5 text-left"
                  aria-expanded={open}
                >
                  <span className="font-medium text-forest-800">{faq.question}</span>
                  <Plus
                    className={cn(
                      "h-4 w-4 shrink-0 text-terracotta-600 transition-transform",
                      open && "rotate-45"
                    )}
                  />
                </button>
                {open && (
                  <p className="pb-5 text-sm leading-relaxed text-forest-800/70">{faq.answer}</p>
                )}
              </div>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
