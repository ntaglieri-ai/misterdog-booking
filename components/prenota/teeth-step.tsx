import { Check } from "lucide-react"
import { useCatalog } from "@/components/catalog-provider"
import { ServiceOption } from "./service-step"

type TeethStepProps = {
  selectedId: string | null
  onSelect: (id: string | null) => void
}

export function TeethStep({ selectedId, onSelect }: TeethStepProps) {
  const { teethServices } = useCatalog()
  return (
    <section aria-labelledby="teeth-title">
      <h2 id="teeth-title" className="mb-1 font-display text-xl text-c-brown">
        Aggiungi la pulizia dei denti?
      </h2>
      <p className="mb-4 text-sm leading-relaxed text-c-gray">
        Pulizia a ultrasuoni, senza anestesia. È facoltativa.
      </p>
      <div className="flex flex-col gap-2" role="radiogroup" aria-labelledby="teeth-title">
        <button
          type="button"
          role="radio"
          aria-checked={selectedId === null}
          onClick={() => onSelect(null)}
          className={[
            "flex items-center gap-3 rounded-[14px] border bg-white px-4 py-3 text-left text-sm font-medium text-c-brown transition-colors",
            selectedId === null
              ? "border-c-amber ring-2 ring-c-amber/30"
              : "border-c-border hover:border-c-amber",
          ].join(" ")}
        >
          <span
            className={[
              "flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full border",
              selectedId === null ? "border-c-amber bg-c-amber text-white" : "border-c-border",
            ].join(" ")}
            aria-hidden="true"
          >
            {selectedId === null && <Check className="h-3 w-3" />}
          </span>
          No, grazie
        </button>
        {teethServices.map((s) => (
          <ServiceOption
            key={s.id}
            service={s}
            active={selectedId === s.id}
            onSelect={() => onSelect(s.id)}
          />
        ))}
      </div>
    </section>
  )
}
