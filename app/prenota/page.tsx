import { CatalogProvider } from "@/components/catalog-provider"
import { readCatalog } from "@/lib/catalog-db"
import { BookingFlow } from "@/components/prenota/booking-flow"

export const dynamic = "force-dynamic"

export default async function PrenotaPage() {
  return <CatalogProvider initialServices={await readCatalog()}><BookingFlow /></CatalogProvider>
}
