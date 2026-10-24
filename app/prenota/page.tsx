import { BookingFlow } from "@/components/prenota/booking-flow"
import { CatalogProvider } from "@/components/catalog-provider"
import { loadCatalog } from "@/lib/catalog"

// Il catalogo si modifica dal gestionale, quindi la pagina non va messa in cache.
export const dynamic = "force-dynamic"

export default async function PrenotaPage() {
  const { services } = await loadCatalog()
  return (
    <CatalogProvider services={services}>
      <BookingFlow />
    </CatalogProvider>
  )
}
