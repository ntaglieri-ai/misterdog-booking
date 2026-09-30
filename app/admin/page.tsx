import { AdminApp } from "@/components/admin/admin-app"
import { PinForm } from "@/components/admin/pin-form"
import { isAdmin, isPinConfigured } from "@/lib/admin-auth"
import { shopNow } from "@/lib/shop-time"

export default async function AdminPage() {
  if (!isPinConfigured()) {
    return <PinForm disabledReason="Il PIN non è ancora configurato. Aggiungi la variabile ADMIN_PIN al progetto." />
  }
  if (!(await isAdmin())) return <PinForm />
  return <AdminApp today={shopNow().date} />
}
