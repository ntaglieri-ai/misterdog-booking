import "server-only"
import { supabaseAdmin } from "@/lib/supabase/admin"

const TOKEN_RE = /^[A-Za-z0-9_-]{32}$/

export function isCancelToken(value: unknown): value is string {
  return typeof value === "string" && TOKEN_RE.test(value)
}

export type OwnAppointment = {
  start_at: string
  end_at: string
  duration_min: number
  services: { id: string; name: string }[]
  size: string
  customer_name: string
  dog_name: string
  status: "confermato" | "cancellato"
}

/** Restituisce solo l'appuntamento legato al token: mai dati di altri clienti. */
export async function getAppointmentByToken(token: string): Promise<OwnAppointment | null> {
  if (!isCancelToken(token)) return null
  const { data, error } = await supabaseAdmin()
    .from("appointments")
    .select("start_at, end_at, duration_min, services, size, customer_name, dog_name, status")
    .eq("cancel_token", token)
    .maybeSingle()
  if (error) {
    console.error("[prenota] Errore lettura appuntamento:", error.message)
    return null
  }
  return data as OwnAppointment | null
}
