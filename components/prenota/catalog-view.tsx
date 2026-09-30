"use client"

import { useState } from "react"
import { ArrowLeft, Clock } from "lucide-react"
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

export function CatalogView({ onBack, onBookService }: CatalogViewProps) {
  const [category, setCategory] = useState<ServiceCategoryId>("bagno-corto")
  const current = categories.find((c) => c.id === category)!
  const visible = services.filter((s) => s.category === category)

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

      <div
        role="tablist"
        aria-label="Categorie servizi"
        className="-mx-4 mb-4 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none]"
      >
        {categories.map((cat) => {
          const active = category === cat.id
          return (
            <button
              key={cat.id}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setCategory(cat.id)}
              className={[
                "flex-shrink-0 rounded-full border px-4 py-2 text-[13px] font-medium transition-colors",
                active
                  ? "border-c-brown bg-c-brown text-white"
                  : "border-c-border bg-white text-c-brown hover:border-c-amber",
              ].join(" ")}
            >
              {cat.label}
            </button>
          )
        })}
      </div>

      {current.note && <p className="mb-3 text-xs text-c-gray">{current.note}</p>}

      <ul className="flex flex-col gap-2.5" role="tabpanel" aria-label={current.label}>
        {visible.map((s) => (
          <li
            key={s.id}
            className="flex items-center gap-3 rounded-[16px] border border-c-border bg-white p-4"
          >
            {s.size && (
              <span className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-c-amber-pale font-display text-base text-c-brown">
                {s.size}
              </span>
            )}
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-c-brown">
                {s.size ? `Taglia ${s.size}` : s.name}
              </p>
              <p className="mt-0.5 flex flex-wrap items-center gap-x-2 text-xs text-c-gray">
                {s.size && <span>es. {s.exampleBreed}</span>}
                <span className="inline-flex items-center gap-1">
                  <Clock className="h-3 w-3" aria-hidden="true" />
                  {formatDuration(s.durationMin)}
                </span>
              </p>
            </div>
            <div className="flex flex-col items-end gap-1.5">
              <span className="text-sm font-semibold text-c-brown">
                {formatPrice(s.priceFrom, s.isFrom)}
              </span>
              {s.category !== "denti" && (
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

      {category === "denti" && (
        <p className="mt-3 text-xs text-c-gray">
          La pulizia dei denti si aggiunge durante la prenotazione di un altro servizio.
        </p>
      )}
      <p className="mt-4 text-xs leading-relaxed text-c-gray">{PRICE_NOTE}</p>
    </div>
  )
}
