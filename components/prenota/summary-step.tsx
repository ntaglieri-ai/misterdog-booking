import {
  formatDuration,
  formatPrice,
  summarize,
  type CatalogService,
  type DogSize,
} from "@/lib/services"

export const PRICE_NOTE =
  "I prezzi sono indicativi e possono variare in base al temperamento del cane e alle condizioni del pelo (nodi, muta, dermatiti)."

type SummaryStepProps = {
  size: DogSize
  services: CatalogService[]
}

export function SummaryStep({ size, services }: SummaryStepProps) {
  const total = summarize(services)
  return (
    <section aria-labelledby="summary-title">
      <h2 id="summary-title" className="mb-4 font-display text-xl text-c-brown">
        Riepilogo
      </h2>
      <div className="rounded-[18px] border border-c-border bg-white p-5">
        <Row label="Taglia" value={size} />
        <ul className="border-b border-c-border py-1">
          {services.map((s) => (
            <li key={s.id} className="flex items-start justify-between gap-3 py-2 text-sm">
              <span className="text-c-brown">
                {s.name}
                <span className="block text-xs text-c-gray">{formatDuration(s.durationMin)}</span>
              </span>
              <span className="whitespace-nowrap font-medium text-c-brown">
                {formatPrice(s.priceFrom, s.isFrom)}
              </span>
            </li>
          ))}
        </ul>
        <Row label="Durata totale" value={formatDuration(total.durationMin)} />
        <div className="flex items-baseline justify-between pt-3">
          <span className="text-sm font-semibold text-c-brown">Totale</span>
          <span className="font-display text-2xl text-c-amber">
            {formatPrice(total.price, total.isFrom)}
          </span>
        </div>
      </div>
      <p className="mt-3 text-xs leading-relaxed text-c-gray">{PRICE_NOTE}</p>
    </section>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between border-b border-c-border py-2.5 text-sm">
      <span className="text-c-gray">{label}</span>
      <span className="font-medium text-c-brown">{value}</span>
    </div>
  )
}
