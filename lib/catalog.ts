import "server-only"
import { buildCatalog, defaultServices, type Catalog, type CatalogService } from "@/lib/services"
import { supabaseAdmin } from "@/lib/supabase/admin"

export type CatalogItem = CatalogService & { active: boolean }

/** Lista completa (anche i servizi nascosti) con le modifiche del salone applicate. */
export async function loadCatalogItems(): Promise<CatalogItem[]> {
  const { data, error } = await supabaseAdmin()
    .from("catalog_overrides")
    .select("service_id, price_from, is_from, duration_min, active")
  // Se la tabella non esiste ancora o il database non risponde, vale il listino di base.
  if (error) {
    console.error("[catalog] uso il listino di base:", error.message)
    return defaultServices.map((s) => ({ ...s, active: true }))
  }
  const overrides = new Map(data.map((o) => [o.service_id as string, o]))
  return defaultServices.map((s) => {
    const o = overrides.get(s.id)
    if (!o) return { ...s, active: true }
    return {
      ...s,
      priceFrom: Number(o.price_from),
      isFrom: o.is_from,
      durationMin: o.duration_min,
      active: o.active,
    }
  })
}

/** Catalogo visibile ai clienti: senza i servizi nascosti. */
export async function loadCatalog(): Promise<Catalog> {
  const items = await loadCatalogItems()
  return buildCatalog(items.filter((s) => s.active).map(({ active: _active, ...s }) => s))
}
