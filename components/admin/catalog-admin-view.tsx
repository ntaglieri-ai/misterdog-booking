"use client"

import { useState } from "react"
import useSWR from "swr"
import { Eye, EyeOff, RotateCcw } from "lucide-react"
import { getCatalogItems, resetCatalogItem, saveCatalogItem } from "@/app/admin/actions"
import type { CatalogItem } from "@/lib/catalog"
import { canHide, categories, defaultServices, formatDuration } from "@/lib/services"
import { cn } from "@/lib/utils"

const inputClass =
  "w-full rounded-[10px] border border-border bg-card px-3 py-2 text-sm text-brown outline-none transition-colors focus:border-amber"

export function CatalogAdminView({ notify }: { notify: (message: string) => void }) {
  const { data, error, isLoading, mutate } = useSWR("admin-catalog", async () => {
    const result = await getCatalogItems()
    if (!result.ok) throw new Error(result.error)
    return result.items
  })

  return (
    <section className="mx-auto max-w-[600px] px-4 py-5">
      <h1 className="font-serif text-xl text-brown">Catalogo</h1>
      <p className="mb-5 text-[13px] text-warm-gray">
        Cambia prezzi, durate e visibilità dei servizi. Le modifiche compaiono subito nella pagina di prenotazione;
        gli appuntamenti già presi non cambiano.
      </p>

      {error && <p role="alert" className="text-sm text-destructive">{error.message}</p>}
      {isLoading && <p className="py-8 text-center text-sm text-warm-gray">Caricamento…</p>}

      {data && (
        <div className="flex flex-col gap-6">
          {categories.map((cat) => {
            const items = data.filter((s) => s.category === cat.id)
            return (
              <div key={cat.id}>
                <h2 className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-warm-gray">{cat.label}</h2>
                <ul className="flex flex-col gap-2">
                  {items.map((item) => (
                    <ServiceRow key={item.id} item={item} notify={notify} onChanged={() => mutate()} />
                  ))}
                </ul>
              </div>
            )
          })}
        </div>
      )}
    </section>
  )
}

function ServiceRow({
  item,
  notify,
  onChanged,
}: {
  item: CatalogItem
  notify: (message: string) => void
  onChanged: () => void
}) {
  const [price, setPrice] = useState(String(item.priceFrom))
  const [duration, setDuration] = useState(String(item.durationMin))
  const [isFrom, setIsFrom] = useState(item.isFrom)
  const [active, setActive] = useState(item.active)
  const [saving, setSaving] = useState(false)
  const base = defaultServices.find((s) => s.id === item.id)!

  const dirty =
    Number(price) !== item.priceFrom ||
    Number(duration) !== item.durationMin ||
    isFrom !== item.isFrom ||
    active !== item.active
  const isModified =
    item.priceFrom !== base.priceFrom ||
    item.durationMin !== base.durationMin ||
    item.isFrom !== base.isFrom ||
    !item.active

  async function save() {
    setSaving(true)
    const result = await saveCatalogItem({
      id: item.id,
      priceFrom: Number(price.replace(",", ".")),
      isFrom,
      durationMin: Number(duration),
      active,
    })
    setSaving(false)
    notify(result.ok ? `${item.name} aggiornato` : result.error)
    if (result.ok) onChanged()
  }

  async function reset() {
    setSaving(true)
    const result = await resetCatalogItem(item.id)
    setSaving(false)
    if (!result.ok) return notify(result.error)
    setPrice(String(base.priceFrom))
    setDuration(String(base.durationMin))
    setIsFrom(base.isFrom)
    setActive(true)
    notify(`${item.name}: valori originali ripristinati`)
    onChanged()
  }

  return (
    <li className={cn("rounded-2xl border border-border bg-card p-3.5", !active && "opacity-60")}>
      <div className="mb-3 flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-[14px] font-semibold text-brown">{item.name}</p>
          <p className="text-xs text-warm-gray">
            {formatDuration(item.durationMin)} · {item.isFrom ? "da " : ""}€{item.priceFrom}
            {!item.active && " · nascosto ai clienti"}
          </p>
        </div>
        {canHide(item) && (
          <button
            type="button"
            onClick={() => setActive((a) => !a)}
            aria-pressed={!active}
            aria-label={active ? `Nascondi ${item.name}` : `Mostra ${item.name}`}
            className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg border border-border text-warm-gray transition-colors hover:border-amber hover:text-sage"
          >
            {active ? <Eye className="h-4 w-4" aria-hidden="true" /> : <EyeOff className="h-4 w-4" aria-hidden="true" />}
          </button>
        )}
      </div>
      <div className="grid grid-cols-2 gap-2.5">
        <label className="text-xs font-medium text-warm-gray">
          Prezzo (€)
          <input
            inputMode="decimal"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className={cn(inputClass, "mt-1")}
          />
        </label>
        <label className="text-xs font-medium text-warm-gray">
          Durata (minuti)
          <input
            inputMode="numeric"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            className={cn(inputClass, "mt-1")}
          />
        </label>
      </div>
      <label className="mt-2.5 flex items-center gap-2 text-[13px] text-brown">
        <input type="checkbox" checked={isFrom} onChange={(e) => setIsFrom(e.target.checked)} className="h-4 w-4 accent-amber" />
        Prezzo indicativo (mostra «da»)
      </label>
      {(dirty || isModified) && (
        <div className="mt-3 flex items-center justify-end gap-2">
          {isModified && (
            <button
              type="button"
              onClick={reset}
              disabled={saving}
              className="flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs font-medium text-warm-gray disabled:opacity-50"
            >
              <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
              Ripristina
            </button>
          )}
          {dirty && (
            <button
              type="button"
              onClick={save}
              disabled={saving}
              className="rounded-full bg-brown px-4 py-1.5 text-xs font-semibold text-cream disabled:opacity-50"
            >
              {saving ? "Salvo…" : "Salva"}
            </button>
          )}
        </div>
      )}
    </li>
  )
}
