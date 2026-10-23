"use client"
import { useState, type FormEvent } from "react"
import { useCatalog } from "@/components/catalog-provider"
import { saveCatalogService } from "@/app/admin/actions"
import { categories, type CatalogService } from "@/lib/services"

export function CatalogEditor() {
  const { services, setServices } = useCatalog()
  return <section className="mx-auto max-w-3xl space-y-5 px-4 py-6">
    <h1 className="font-display text-2xl">Catalogo servizi</h1>
    <p className="text-sm text-warm-gray">Modifica nomi, prezzi e durate. Le modifiche valgono per le nuove prenotazioni; gli appuntamenti già salvati conservano servizio e durata originali.</p>
    {categories.map(category => <div key={category.id} className="space-y-3">
      <h2 className="font-semibold">{category.label}</h2>
      {services.filter(s => s.category === category.id).map(service => <ServiceEditor key={service.id} service={service} onSaved={updated => setServices(services.map(s => s.id === updated.id ? updated : s))} />)}
    </div>)}
  </section>
}

function ServiceEditor({ service, onSaved }: { service: CatalogService; onSaved: (service: CatalogService) => void }) {
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState("")
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    const updated = { ...service, name: String(form.get("name")).trim(), priceFrom: Number(form.get("price")), durationMin: Number(form.get("duration")), isFrom: form.get("from") === "on" }
    setSaving(true)
    setMessage("")
    try {
      const result = await saveCatalogService(updated)
      if (result.ok) { onSaved(updated); setMessage("Salvato") }
      else setMessage(result.error)
    } catch { setMessage("Salvataggio non riuscito. Riprova.") }
    finally { setSaving(false) }
  }
  const field = "mt-1 w-full rounded-lg border border-border bg-white px-3 py-2 text-sm"
  return <form onSubmit={submit} className="space-y-3 rounded-xl border border-border bg-card p-4">
    <fieldset disabled={saving} className="space-y-3">
      <legend className="sr-only">{service.name}</legend>
      <label className="block text-sm">Nome servizio<input className={field} name="name" defaultValue={service.name} required maxLength={120} /></label>
      <div className="grid grid-cols-2 gap-3">
        <label className="text-sm">Prezzo (€)<input className={field} type="number" name="price" defaultValue={service.priceFrom} min="0" max="9999" step="0.01" required /></label>
        <label className="text-sm">Durata (minuti)<input className={field} type="number" name="duration" defaultValue={service.durationMin} min="5" max="480" step="1" required /></label>
      </div>
      <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="from" defaultChecked={service.isFrom} />Mostra prezzo «a partire da»</label>
      <button className="rounded-full bg-amber px-5 py-2 text-sm font-semibold text-white" type="submit">{saving ? "Salvataggio…" : "Salva"}</button>
    </fieldset>
    <p role="status" className="text-sm">{message}</p>
  </form>
}
