"use client"

import { Calendar, Plus, Users } from "lucide-react"
import { cn } from "@/lib/utils"

export type Section = "agenda" | "prenota" | "clienti"

const tabs: { id: Section; label: string; icon: typeof Calendar }[] = [
  { id: "agenda", label: "Agenda", icon: Calendar },
  { id: "prenota", label: "Prenota", icon: Plus },
  { id: "clienti", label: "Clienti", icon: Users },
]

export function NavTabs({
  active,
  onChange,
}: {
  active: Section
  onChange: (section: Section) => void
}) {
  return (
    <nav className="flex border-b border-border bg-card" aria-label="Sezioni">
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
              "flex flex-1 items-center justify-center gap-1.5 whitespace-nowrap border-b-2 px-2 py-3.5 text-[13px] font-medium transition-colors",
              isActive
                ? "border-amber text-amber"
                : "border-transparent text-warm-gray",
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
