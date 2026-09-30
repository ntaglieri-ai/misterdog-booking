"use client"

import { useMemo, useState } from "react"
import useSWR from "swr"
import { PawPrint, Phone, Search } from "lucide-react"
import { listClients } from "@/app/admin/actions"
import { formatShortDate } from "@/lib/admin-format"

export function ClientsView() {
  const [query, setQuery] = useState("")
  const { data, error, isLoading } = useSWR("admin-clients", async () => {
    const result = await listClients()
    if (!result.ok) throw new Error(result.error)
    return result.clients
  })

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!data || !q) return data ?? []
    return data.filter(
      (c) =>
        c.customerName.toLowerCase().includes(q) ||
        c.dogs.some((d) => d.toLowerCase().includes(q)) ||
        c.phone.replace(/\D/g, "").includes(q.replace(/\D/g, "") || "\u0000"),
    )
  }, [data, query])

  return (
    <section className="mx-auto max-w-[600px] px-4 py-5">
      <h1 className="font-serif text-xl text-brown">Clienti</h1>
      <p className="mb-5 text-[13px] text-warm-gray">
        {data ? `${data.length} ${data.length === 1 ? "cliente" : "clienti"} dalle prenotazioni` : "\u00a0"}
      </p>

      <div className="relative mb-4">
        <Search
          className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-warm-gray"
          aria-hidden="true"
        />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Cerca cliente, cane o telefono…"
          aria-label="Cerca cliente, cane o telefono"
          className="w-full rounded-[10px] border border-border bg-card py-2.5 pl-10 pr-3.5 text-sm text-brown outline-none transition-colors focus:border-amber"
        />
      </div>

      {error && <p role="alert" className="text-sm text-destructive">{error.message}</p>}
      {isLoading && <p className="py-8 text-center text-sm text-warm-gray">Caricamento…</p>}
      {data && filtered.length === 0 && (
        <p className="rounded-2xl border border-border bg-card p-5 text-center text-sm text-warm-gray">
          {data.length ? "Nessun risultato." : "Ancora nessun cliente: compariranno con le prime prenotazioni."}
        </p>
      )}

      <ul className="flex flex-col gap-2.5">
        {filtered.map((c) => (
          <li key={c.phone} className="rounded-2xl border border-border bg-card p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="text-[15px] font-semibold text-brown">{c.customerName}</div>
                <div className="mt-0.5 flex items-center gap-1.5 text-[13px] text-warm-gray">
                  <PawPrint className="h-3.5 w-3.5 flex-shrink-0" aria-hidden="true" />
                  <span className="truncate">{c.dogs.join(", ") || "—"}</span>
                </div>
              </div>
              {c.nextDate && (
                <span className="flex-shrink-0 rounded-full bg-amber/15 px-2.5 py-1 text-[11px] font-semibold capitalize text-sage">
                  {formatShortDate(c.nextDate)}
                </span>
              )}
            </div>
            <div className="mt-3 flex items-center justify-between gap-3 text-[13px]">
              <a href={`tel:${c.phone.replace(/[^\d+]/g, "")}`} className="flex items-center gap-1.5 font-medium text-sage">
                <Phone className="h-3.5 w-3.5" aria-hidden="true" />
                {c.phone}
              </a>
              <span className="text-warm-gray">
                {c.visits} {c.visits === 1 ? "visita" : "visite"}
                {c.lastDate && ` · ultima ${formatShortDate(c.lastDate)}`}
              </span>
            </div>
          </li>
        ))}
      </ul>
    </section>
  )
}
