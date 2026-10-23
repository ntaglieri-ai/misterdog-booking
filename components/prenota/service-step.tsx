"use client"

import { useCatalog } from "@/components/catalog-provider"
import { Check, Clock } from "lucide-react"
import {
  categories,
  formatDuration,
  formatPrice,
  type CatalogService,
  type DogSize,
} from "@/lib/services"

type ServiceStepProps = {
  size: DogSize
  selectedId: string | null
  onSelect: (id: string) => void
}

export function ServiceStep({ size, selectedId, onSelect }: ServiceStepProps) {
  const { getBath, groomingServices } = useCatalog()
  const baths = [getBath("corto", size), getBath("lungo", size)]
  const groups = (["riccio", "liscio", "extra"] as const).map((cat) => ({
    category: categories.find((c) => c.id === cat)!,
    items: groomingServices.filter((s) => s.category === cat),
  }))

  return (
    <section aria-labelledby="service-title" className="flex flex-col gap-5">
      <div>
        <h2 id="service-title" className="mb-1 font-display text-xl text-c-brown">
          Che servizio desideri?
        </h2>
        <p className="text-sm leading-relaxed text-c-gray">
          Scegli un bagno per la taglia {size} oppure una tosatura.
        </p>
      </div>

      <ServiceGroup title="Bagno" items={baths} selectedId={selectedId} onSelect={onSelect} />
      {groups.map((g) => (
        <ServiceGroup
          key={g.category.id}
          title={g.category.label}
          note={g.category.note}
          items={g.items}
          selectedId={selectedId}
          onSelect={onSelect}
        />
      ))}
    </section>
  )
}

export function CatServiceStep({
  selectedId,
  onSelect,
}: {
  selectedId: string | null
  onSelect: (id: string) => void
}) {
  const { catServices } = useCatalog()
  return (
    <section aria-labelledby="cat-service-title" className="flex flex-col gap-5">
      <div>
        <h2 id="cat-service-title" className="mb-1 font-display text-xl text-c-brown">
          Che pelo ha il tuo gatto?
        </h2>
        <p className="text-sm leading-relaxed text-c-gray">Scegli il bagno adatto al suo mantello.</p>
      </div>
      <ServiceGroup title="Bagno gatto" items={catServices} selectedId={selectedId} onSelect={onSelect} />
    </section>
  )
}

export function ServiceGroup({
  title,
  note,
  items,
  selectedId,
  onSelect,
}: {
  title: string
  note?: string
  items: CatalogService[]
  selectedId: string | null
  onSelect: (id: string) => void
}) {
  return (
    <div>
      <h3 className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-c-gray">
        {title}
        {note && <span className="font-normal normal-case tracking-normal"> · {note}</span>}
      </h3>
      <div className="flex flex-col gap-2" role="radiogroup" aria-label={title}>
        {items.map((s) => (
          <ServiceOption
            key={s.id}
            service={s}
            active={selectedId === s.id}
            onSelect={() => onSelect(s.id)}
          />
        ))}
      </div>
    </div>
  )
}

export function ServiceOption({
  service,
  active,
  onSelect,
}: {
  service: CatalogService
  active: boolean
  onSelect: () => void
}) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={active}
      onClick={onSelect}
      className={[
        "flex items-center gap-3 rounded-[14px] border bg-white px-4 py-3 text-left transition-colors",
        active ? "border-c-amber ring-2 ring-c-amber/30" : "border-c-border hover:border-c-amber",
      ].join(" ")}
    >
      <span
        className={[
          "flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full border",
          active ? "border-c-amber bg-c-amber text-white" : "border-c-border",
        ].join(" ")}
        aria-hidden="true"
      >
        {active && <Check className="h-3 w-3" />}
      </span>
      <span className="flex-1 text-sm">
        <span className="block font-medium text-c-brown">{service.name}</span>
        <span className="mt-0.5 flex items-center gap-1 text-xs text-c-gray">
          <Clock className="h-3 w-3" aria-hidden="true" />
          {formatDuration(service.durationMin)}
        </span>
      </span>
      <span className="text-sm font-semibold text-c-brown">
        {formatPrice(service.priceFrom, service.isFrom)}
      </span>
    </button>
  )
}
