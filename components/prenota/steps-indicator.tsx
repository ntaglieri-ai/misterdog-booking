import { Check } from "lucide-react"

const steps = [
  { n: 1, label: "Data" },
  { n: 2, label: "Servizi" },
  { n: 3, label: "Conferma" },
]

export function StepsIndicator({ current }: { current: 1 | 2 | 3 }) {
  return (
    <div className="mb-2 flex items-center gap-0 pb-1 pt-5">
      {steps.map((step, i) => {
        const done = step.n < current
        const active = step.n === current
        return (
          <div key={step.n} className="contents">
            <div className="flex flex-1 items-center gap-1.5">
              <div
                className={[
                  "flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full text-[11px] font-semibold transition-colors",
                  done && "bg-c-sage text-white",
                  active && "bg-c-amber text-white",
                  !done && !active && "bg-c-border text-c-gray",
                ]
                  .filter(Boolean)
                  .join(" ")}
              >
                {done ? <Check className="h-3.5 w-3.5" aria-hidden="true" /> : step.n}
              </div>
              <div className="whitespace-nowrap text-[11px] text-c-gray">
                {step.label}
              </div>
            </div>
            {i < steps.length - 1 && (
              <div className="mx-1 h-px flex-1 bg-c-border" aria-hidden="true" />
            )}
          </div>
        )
      })}
    </div>
  )
}
