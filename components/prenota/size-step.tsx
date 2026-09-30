import { Check } from "lucide-react"
import { sizes, type DogSize } from "@/lib/services"

type SizeStepProps = {
  selected: DogSize | null
  onSelect: (size: DogSize) => void
}

export function SizeStep({ selected, onSelect }: SizeStepProps) {
  return (
    <section aria-labelledby="size-title">
      <h2 id="size-title" className="mb-1 font-display text-xl text-c-brown">
        Quanto è grande il tuo cane?
      </h2>
      <p className="mb-4 text-sm leading-relaxed text-c-gray">
        Scegli la taglia più vicina: la razza è solo un esempio.
      </p>
      <div className="flex flex-col gap-2.5" role="radiogroup" aria-labelledby="size-title">
        {sizes.map((size) => {
          const active = selected === size.id
          return (
            <button
              key={size.id}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => onSelect(size.id)}
              className={[
                "flex items-center gap-4 rounded-[16px] border bg-white p-4 text-left transition-colors",
                active ? "border-c-amber ring-2 ring-c-amber/30" : "border-c-border hover:border-c-amber",
              ].join(" ")}
            >
              <span
                className={[
                  "flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl font-display text-lg",
                  active ? "bg-c-amber text-white" : "bg-c-amber-pale text-c-brown",
                ].join(" ")}
              >
                {size.id}
              </span>
              <span className="flex-1 text-sm text-c-brown">
                <span className="font-semibold">Taglia {size.id}</span>
                <span className="block text-c-gray">es. {size.exampleBreed}</span>
              </span>
              {active && <Check className="h-5 w-5 text-c-amber" aria-hidden="true" />}
            </button>
          )
        })}
      </div>
    </section>
  )
}
