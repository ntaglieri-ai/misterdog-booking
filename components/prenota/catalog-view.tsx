"use client"

import { useEffect, useRef, useState } from "react"
import { ArrowLeft, Cat, Clock, Droplet, Scissors, Smile, Sparkles } from "lucide-react"
import {
  categories,
  formatDuration,
  formatPrice,
  services,
  type CatalogService,
  type ServiceCategoryId,
} from "@/lib/services"
import { PRICE_NOTE } from "./summary-step"

type CatalogViewProps = {
  onBack: () => void
  onBookService: (service: CatalogService) => void
}

const categoryIcons: Record<ServiceCategoryId, typeof Droplet> = {
  "bagno-corto": Droplet,
  "bagno-lungo": Droplet,
  riccio: Scissors,
  liscio: Scissors,
  extra: Sparkles,
  gatto: Cat,
  denti: Smile,
}

export function CatalogView({ onBack, onBookService }: CatalogViewProps) {
  const [active, setActive] = useState<ServiceCategoryId>(categories[0].id)
  const sectionRefs = useRef<Partial<Record<ServiceCategoryId, HTMLElement | null>>>({})

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)
        if (visible[0]) setActive(visible[0].target.id as ServiceCategoryId)
      },
      { rootMargin: "-120px 0px -65% 0px", threshold: 0 },
    )
    Object.values(sectionRefs.current).forEach((el) => el && observer.observe(el))
    return () => observer.disconnect()
  }, [])

  const scrollTo = (id: ServiceCategoryId) => {
    sectionRefs.current[id]?.scrollIntoView({ behavior: "smooth", block: "start" })
  }

  return (
    <div className="pt-4">
      <button
        type="button"
        onClick={onBack}
        className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-c-gray transition-colors hover:text-c-brown"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Indietro
      </button>

      <h1 className="font-display text-[26px] leading-tight text-c-brown text-balance">
        Il nostro catalogo
      </h1>
      <p className="mb-4 mt-1 text-sm leading-relaxed text-c-gray">
        Servizi e prezzi indicativi del salone.
      </p>

      <div className="sticky top-0 z-10 -mx-4 mb-5 border-b border-c-border bg-c-bg/95 px-4 pb-2 pt-1 backdrop-blur-sm">
        <div
          role="tablist"
          aria-label="Vai alla categoria"
          className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none]"
        >
          {categories.map((cat) => {
            const isActive = active === cat.id
            return (
              <button
                key={cat.id}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => scrollTo(cat.id)}
                className={[
                  "flex-shrink-0 rounded-full border px-3.5 py-1.5 text-[13px] font-medium transition-colors",
                  isActive
                    ? "border-c-brown bg-c-brown text-white"
                    : "border-c-border bg-white text-c-brown hover:border-c-amber",
                ].join(" ")}
              >
                {cat.label}
              </button>
            )
          })}
        </div>
      </div>

      <div className="flex flex-col gap-7">
        {categories.map((cat) => {
          const Icon = categoryIcons[cat.id]
          const items = services.filter((s) => s.category === cat.id)
          const sized = items.every((s) => s.size)

          return (
            <section
              key={cat.id}
              id={cat.id}
              ref={(el) => {
                sectionRefs.current[cat.id] = el
              }}
              className="scroll-mt-20"
              aria-label={cat.label}
            >
              <div className="mb-3 flex items-center gap-2.5">
                <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-c-amber-pale text-c-brown">
                  <Icon className="h-4 w-4" aria-hidden="true" />
                </span>
                <div>
                  <h2 className="text-sm font-semibold text-c-brown">{cat.label}</h2>
                  {cat.note && <p className="text-xs text-c-gray">{cat.note}</p>}
                </div>
              </div>

              {sized ? (
                <div className="grid grid-cols-3 gap-2">
                  {items.map((s) => (
                    <div
                      key={s.id}
                      className="flex flex-col items-center gap-1.5 rounded-[14px] border border-c-border bg-white p-2.5 text-center"
                    >
                      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-c-amber-pale font-display text-sm text-c-brown">
                        {s.size}
                      </span>
                      <p className="truncate text-[11px] text-c-gray">{s.exampleBreed}</p>
                      <p className="text-[13px] font-semibold text-c-brown">
                        {formatPrice(s.priceFrom, s.isFrom)}
                      </p>
                      <p className="flex items-center gap-1 text-[10px] text-c-gray">
                        <Clock className="h-2.5 w-2.5" aria-hidden="true" />
                        {formatDuration(s.durationMin)}
                      </p>
                      <button
                        type="button"
                        onClick={() => onBookService(s)}
                        className="mt-0.5 w-full rounded-full bg-c-amber px-2 py-1 text-[11px] font-semibold text-white transition-colors hover:bg-[#2e90c4]"
                      >
                        Prenota
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <ul className="flex flex-col gap-2">
                  {items.map((s) => (
                    <li
                      key={s.id}
                      className="flex items-center gap-3 rounded-[14px] border border-c-border bg-white p-3.5"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-c-brown">{s.name}</p>
                        <p className="mt-0.5 flex items-center gap-1 text-xs text-c-gray">
                          <Clock className="h-3 w-3" aria-hidden="true" />
                          {formatDuration(s.durationMin)}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-1.5">
                        <span className="text-sm font-semibold text-c-brown">
                          {formatPrice(s.priceFrom, s.isFrom)}
                        </span>
                        {cat.id !== "denti" && (
                          <button
                            type="button"
                            onClick={() => onBookService(s)}
                            className="rounded-full bg-c-amber px-3 py-1 text-xs font-semibold text-white transition-colors hover:bg-[#2e90c4]"
                          >
                            Prenota
                          </button>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              )}

              {cat.id === "denti" && (
                <p className="mt-3 text-xs text-c-gray">
                  La pulizia dei denti si aggiunge durante la prenotazione di un altro servizio.
                </p>
              )}
            </section>
          )
        })}
      </div>

      <p className="mt-6 text-xs leading-relaxed text-c-gray">{PRICE_NOTE}</p>
    </div>
  )
}
