"use client"

import { Calendar, CalendarX, ListChecks, Plus, Users } from "lucide-react"
import { cn } from "@/lib/utils"

export type Section = "agenda" | "nuovo" | "chiusure" | "clienti" | "catalogo"

const tabs: { id: Section; label: string; icon: typeof Calendar }[] = [
  { id: "agenda", label: "Agenda", icon: Calendar },
  { id: "nuovo", label: "Nuovo", icon: Plus },
  { id: "chiusure", label: "Chiusure", icon: CalendarX },
  { id: "clienti", label: "Clienti", icon: Users },
  { id: "catalogo", label: "Catalogo", icon: ListChecks },
]

export function NavTabs({
  active,
  onChange,
}: {
  active: Section
  onChange: (section: Section) => void
}) {
  return (
    <nav className="sticky top-[68px] z-30 flex border-b border-border bg-card" aria-label="Sezioni">
      {tabs.map((tab) => {
        const Icon = tab.icon
        const isActive = active === tab.id
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            aria-current={isActive ? "page" : undefined}
            className={cn(
              "flex flex-1 flex-col items-center justify-center gap-1 whitespace-nowrap border-b-2 px-1 py-2.5 text-[12px] font-medium transition-colors sm:flex-row sm:gap-1.5 sm:py-3.5 sm:text-[13px]",
              isActive ? "border-amber text-sage" : "border-transparent text-warm-gray",
            )}
          >
            <Icon className="h-4 w-4" aria-hidden="true" />
            {tab.label}
          </button>
        )
      })}
    </nav>
  )
}
