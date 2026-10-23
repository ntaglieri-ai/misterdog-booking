import "server-only"
import { services, type CatalogService } from "@/lib/services"
import { supabaseAdmin } from "@/lib/supabase/admin"

export async function readCatalog(): Promise<CatalogService[]> {
  const { data, error } = await supabaseAdmin().from("catalog_services").select("id, name, price_from, duration_min, is_from")
  if (error) {
    // Consente l'aggiornamento del codice prima di applicare la migrazione 004.
    if (error.code === "PGRST205" || error.code === "42P01") return services
    throw new Error(error.message)
  }
  const overrides = new Map((data ?? []).map(row => [row.id, row]))
  return services.map(service => {
    const row = overrides.get(service.id)
    return row ? { ...service, name: row.name, priceFrom: row.price_from, durationMin: row.duration_min, isFrom: row.is_from } : service
  })
}
