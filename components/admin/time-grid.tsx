"use client"

import { formatMinutes } from "@/lib/admin-format"
import { cn } from "@/lib/utils"

export function TimeGrid({
  starts,
  loading,
  selected,
  onSelect,
}: {
  starts: number[] | undefined
  loading: boolean
  selected: number | null
  onSelect: (start: number) => void
}) {
  if (loading && !starts) return <p className="py-4 text-sm text-warm-gray">Cerco gli orari liberi…</p>
  if (!starts?.length) {
    return (
      <p className="rounded-xl bg-muted px-4 py-3 text-sm text-warm-gray">
        Nessun orario libero in questo giorno.
      </p>
    )
  }
  return (
    <div role="radiogroup" aria-label="Orari liberi" className="grid grid-cols-4 gap-2 sm:grid-cols-5">
      {starts.map((s) => (
        <button
          key={s}
          type="button"
          role="radio"
          aria-checked={selected === s}
          onClick={() => onSelect(s)}
          className={cn(
            "rounded-lg border py-2.5 text-sm font-medium tabular-nums transition-colors",
            selected === s
              ? "border-brown bg-brown text-cream"
              : "border-border bg-card text-brown hover:border-amber",
          )}
        >
          {formatMinutes(s)}
        </button>
      ))}
    </div>
  )
}
