"use client"

import { useEffect, useRef, useState } from "react"
import { ArrowLeft, Cat, ChevronRight, Clock, Droplet, Scissors, Smile, Sparkles } from "lucide-react"
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
  const tabsRef = useRef<HTMLDivElement | null>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)

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

  useEffect(() => {
    const el = tabsRef.current
    if (!el) return

    const updateFades = () => {
      setCanScrollLeft(el.scrollLeft > 4)
      setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4)
    }

    updateFades()
    el.addEventListener("scroll", updateFades, { passive: true })
    const resizeObserver = new ResizeObserver(updateFades)
    resizeObserver.observe(el)
    return () => {
      el.removeEventListener("scroll", updateFades)
      resizeObserver.disconnect()
    }
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

      <h1 className="font-display text-[30px] leading-tight tracking-tight text-c-brown text-balance">
        Il nostro catalogo
      </h1>
      <p className="mb-4 mt-1.5 text-[15px] leading-relaxed text-c-gray">
        Servizi e prezzi indicativi del salone.
      </p>

      <div className="sticky top-0 z-10 -mx-4 mb-6 border-b border-c-border bg-c-bg/95 pb-3 pt-1 backdrop-blur-sm">
        <div className="relative">
          <div
            ref={tabsRef}
            role="tablist"
            aria-label="Vai alla categoria"
            className="flex gap-2 overflow-x-auto px-4 pb-1 [-webkit-overflow-scrolling:touch] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
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
                    "flex-shrink-0 whitespace-nowrap rounded-full border px-4 py-2 text-[13.5px] font-semibold transition-colors",
                    isActive
                      ? "border-c-brown bg-c-brown text-white shadow-sm"
                      : "border-c-border bg-c-amber-pale text-c-brown hover:border-c-amber",
                  ].join(" ")}
                >
                  {cat.label}
                </button>
              )
            })}
          </div>

          <div
            aria-hidden="true"
            className={[
              "pointer-events-none absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-c-bg to-transparent transition-opacity duration-200",
              canScrollLeft ? "opacity-100" : "opacity-0",
            ].join(" ")}
          />
          <div
            aria-hidden="true"
            className={[
              "pointer-events-none absolute inset-y-0 right-0 flex w-12 items-center justify-end bg-gradient-to-l from-c-bg to-transparent pr-1 transition-opacity duration-200",
              canScrollRight ? "opacity-100" : "opacity-0",
            ].join(" ")}
          >
            <ChevronRight className="h-4 w-4 flex-shrink-0 text-c-amber" aria-hidden="true" />
          </div>
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
              <div className="mb-3.5 flex items-center gap-3">
                <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-c-amber-pale text-c-brown">
                  <Icon className="h-4 w-4" aria-hidden="true" />
                </span>
                <div>
                  <h2 className="font-display text-[15px] font-semibold text-c-brown">{cat.label}</h2>
                  {cat.note && <p className="text-xs text-c-gray">{cat.note}</p>}
                </div>
              </div>

              {sized ? (
                <ul className="flex flex-col gap-2.5">
                  {items.map((s) => (
                    <li
                      key={s.id}
                      className="flex items-center gap-4 rounded-[18px] border border-c-border bg-white p-4 shadow-[0_1px_2px_rgba(26,46,90,0.04),0_8px_20px_-16px_rgba(26,46,90,0.2)]"
                    >
                      <span className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-c-amber-pale font-display text-base font-semibold text-c-brown">
                        {s.size}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-c-brown">Taglia {s.size}</p>
                        <p className="mt-0.5 flex items-center gap-1 text-xs text-c-gray">
                          <Clock className="h-3 w-3" aria-hidden="true" />
                          {formatDuration(s.durationMin)}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-1.5">
                        <span className="text-sm font-semibold text-c-brown">
                          {formatPrice(s.priceFrom, s.isFrom)}
                        </span>
                        <button
                          type="button"
                          onClick={() => onBookService(s)}
                          className="rounded-full bg-c-amber px-3.5 py-1.5 text-[13px] font-semibold text-white transition-colors hover:bg-[#2e90c4]"
                        >
                          Prenota
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <ul className="flex flex-col gap-2.5">
                  {items.map((s) => (
                    <li
                      key={s.id}
                      className="flex items-center gap-3 rounded-[18px] border border-c-border bg-white p-4 shadow-[0_1px_2px_rgba(26,46,90,0.04),0_8px_20px_-16px_rgba(26,46,90,0.2)]"
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
                            className="rounded-full bg-c-amber px-3.5 py-1.5 text-[13px] font-semibold text-white transition-colors hover:bg-[#2e90c4]"
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
