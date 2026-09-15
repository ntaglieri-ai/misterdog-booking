"use client"

import { PawPrint, Phone, Search } from "lucide-react"
import { clients } from "@/lib/data"
import { cn } from "@/lib/utils"

export function ClientiSection({ onOpenProfile }: { onOpenProfile: () => void }) {
  return (
    <section className="mx-auto max-w-[600px] px-4 py-5">
      <h1 className="font-serif text-xl text-brown">Clienti</h1>
      <p className="mb-5 text-[13px] text-warm-gray">3 clienti attivi</p>

      <div className="relative mb-3.5">
        <Search
          className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-warm-gray"
          aria-hidden="true"
        />
        <input
          type="text"
          placeholder="Cerca cliente o animale..."
          aria-label="Cerca cliente o animale"
          className="w-full rounded-[10px] border border-border bg-card py-2.5 pl-10 pr-3.5 text-sm text-brown outline-none transition-colors focus:border-amber"
        />
      </div>

      {clients.map((client) => (
        <button
          key={client.name}
          type="button"
          onClick={onOpenProfile}
          className="mb-3 block w-full rounded-2xl border border-border bg-card p-[18px] text-left"
        >
          <div className="mb-3 flex items-start justify-between">
            <div>
              <div className="text-[15px] font-semibold text-brown">{client.name}</div>
              <div className="mt-0.5 flex items-center gap-1.5 text-xs text-warm-gray">
                <PawPrint className="h-3.5 w-3.5" aria-hidden="true" />
                {client.pet} · {client.breed}
              </div>
            </div>
            <span
              className={cn(
                "rounded-full px-2.5 py-1 text-[11px] font-medium",
                client.status.tone === "green"
                  ? "bg-[#E8F4FB] text-[#2E90C4]"
                  : "bg-[#FDECE6] text-[#C4562E]",
              )}
            >
              {client.status.label}
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-warm-gray">
            <Phone className="h-3 w-3" aria-hidden="true" />
            {client.phone} · Ultima visita: {client.lastVisit}
          </div>
          <div className="mt-2.5 flex flex-wrap gap-1.5">
            {client.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-border bg-cream px-2.5 py-0.5 text-[11px] text-brown"
              >
                {tag}
              </span>
            ))}
          </div>
        </button>
      ))}
    </section>
  )
}
