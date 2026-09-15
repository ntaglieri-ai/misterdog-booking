"use client"

import { Check } from "lucide-react"
import { services, pet } from "@/lib/booking-data"

type ServicesStepProps = {
  selected: string[]
  onToggle: (id: string) => void
}

export function ServicesStep({ selected, onToggle }: ServicesStepProps) {
  return (
    <div className="rounded-[18px] border border-c-border bg-white p-5">
      <h2 className="mb-3.5 font-display text-[17px] text-c-brown">
        Cosa serve a {pet.name}?
      </h2>
      {services.map((service) => {
        const Icon = service.icon
        const checked = selected.includes(service.id)
        return (
          <button
            key={service.id}
            type="button"
            onClick={() => onToggle(service.id)}
            className="flex w-full items-center justify-between border-b border-c-border py-3.5 text-left last:border-b-0"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-[38px] w-[38px] items-center justify-center rounded-[10px] bg-c-amber-pale">
                <Icon className="h-[18px] w-[18px] text-c-amber" aria-hidden="true" />
              </div>
              <div>
                <div className="text-sm font-medium text-c-brown">
                  {service.name}
                </div>
                <div className="mt-0.5 text-xs text-c-gray">
                  {service.description} · €{service.price}
                </div>
              </div>
            </div>
            <span
              className={[
                "flex h-[22px] w-[22px] flex-shrink-0 items-center justify-center rounded-full border-2 transition-colors",
                checked
                  ? "border-c-amber bg-c-amber text-white"
                  : "border-c-border",
              ].join(" ")}
              aria-hidden="true"
            >
              {checked && <Check className="h-3 w-3" strokeWidth={3} />}
            </span>
          </button>
        )
      })}
    </div>
  )
}
