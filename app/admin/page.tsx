import { AdminApp } from "@/components/admin/admin-app"
import { PinForm } from "@/components/admin/pin-form"
import { CatalogProvider } from "@/components/catalog-provider"
import { isAdmin, isPinConfigured } from "@/lib/admin-auth"
import { loadCatalog } from "@/lib/catalog"
import { shopNow } from "@/lib/shop-time"

export const dynamic = "force-dynamic"

export default async function AdminPage() {
  if (!isPinConfigured()) {
    return <PinForm disabledReason="Il PIN non è ancora configurato. Aggiungi la variabile ADMIN_PIN al progetto." />
  }
  if (!(await isAdmin())) return <PinForm />
  const { services } = await loadCatalog()
  return (
    <CatalogProvider services={services}>
      <AdminApp today={shopNow().date} />
    </CatalogProvider>
  )
}
