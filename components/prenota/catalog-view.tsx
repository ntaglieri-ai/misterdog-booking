"use client"

import { useState } from "react"
import { ArrowLeft, Check, Clock } from "lucide-react"
import {
  services,
  serviceCategories,
  type ServiceCategory,
} from "@/lib/booking-data"

type CatalogViewProps = {
  onBack: () => void
  onBookService: (serviceId: string) => void
}

export function CatalogView({ onBack, onBookService }: CatalogViewProps) {
  const [category, setCategory] = useState<ServiceCategory | "tutti">("tutti")

  const visible =
    category === "tutti" ? services : services.filter((s) => s.category === category)

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
        Tutti i trattamenti del salone, pensati per il benessere del tuo amico a 4 zampe.
      </p>

      <div
        role="tablist"
        aria-label="Categorie servizi"
        className="mb-4 flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none]"
      >
        {serviceCategories.map((cat) => {
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

      <ul className="flex flex-col gap-3">
        {visible.map((service) => {
          const Icon = service.icon
          return (
            <li
              key={service.id}
              className="rounded-[18px] border border-c-border bg-white p-4"
            >
              <div className="mb-3 flex items-start gap-3">
                <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-c-amber-pale">
                  <Icon className="h-5 w-5 text-c-amber" aria-hidden="true" />
                </div>
                <div className="min-w-0 flex-1">
                  <h2 className="text-[15px] font-semibold text-c-brown">{service.name}</h2>
                  <p className="mt-0.5 text-[13px] text-c-gray">{service.description}</p>
                </div>
                <span className="inline-flex flex-shrink-0 items-center gap-1 rounded-full bg-c-amber-pale px-2.5 py-1 text-[11px] font-medium text-c-brown">
                  <Clock className="h-3 w-3" aria-hidden="true" />
                  {service.duration}
                </span>
              </div>

              <ul className="mb-4 flex flex-col gap-1.5">
                {service.includes.map((item) => (
                  <li key={item} className="flex items-center gap-2 text-[13px] text-c-brown">
                    <Check className="h-3.5 w-3.5 flex-shrink-0 text-c-amber" aria-hidden="true" />
                    {item}
                  </li>
                ))}
              </ul>

              <button
                type="button"
                onClick={() => onBookService(service.id)}
                className="w-full rounded-xl border border-c-amber py-2.5 text-[13px] font-semibold text-c-amber transition-colors hover:bg-c-amber hover:text-white"
              >
                Prenota questo servizio
              </button>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
