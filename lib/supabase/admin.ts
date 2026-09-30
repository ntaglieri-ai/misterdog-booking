import "server-only"
import { createClient, type SupabaseClient } from "@supabase/supabase-js"

let client: SupabaseClient | null = null

/**
 * Client con chiave service role: ignora la RLS, quindi va usato solo lato server.
 * SUPABASE_SECRET_KEY è il nome con cui l'integrazione Vercel fornisce la stessa chiave.
 */
export function supabaseAdmin() {
  if (client) return client
  const url = process.env.SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_SECRET_KEY
  if (!url || !key) throw new Error("Supabase non configurato (SUPABASE_URL / service role key)")
  client = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
  return client
}
