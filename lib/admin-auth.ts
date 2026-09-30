import "server-only"
import { createHmac, timingSafeEqual } from "node:crypto"
import { cookies, headers } from "next/headers"
import { supabaseAdmin } from "@/lib/supabase/admin"

const COOKIE = "md_admin"
const SESSION_DAYS = 30
const MAX_FAILURES = 5
const LOCK_MS = 15 * 60 * 1000

/** Il cookie contiene solo una firma derivata dal PIN: cambiando ADMIN_PIN si esce da tutti i dispositivi. */
function sessionValue() {
  const pin = process.env.ADMIN_PIN
  const pepper = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_SECRET_KEY ?? ""
  if (!pin) return null
  return createHmac("sha256", `${pin}:${pepper}`).update("misterdog-admin-v1").digest("base64url")
}

function safeEqual(a: string, b: string) {
  const ab = Buffer.from(a)
  const bb = Buffer.from(b)
  return ab.length === bb.length && timingSafeEqual(ab, bb)
}

export function isPinConfigured() {
  return Boolean(process.env.ADMIN_PIN)
}

export async function isAdmin() {
  const expected = sessionValue()
  if (!expected) return false
  const value = (await cookies()).get(COOKIE)?.value
  return Boolean(value && safeEqual(value, expected))
}

export async function requireAdmin() {
  if (!(await isAdmin())) throw new Error("Non autorizzato")
}

type Attempt = { failures: number; lockedUntil: number }

// Fallback in memoria se la tabella admin_login_attempts non è ancora stata creata.
const memoryAttempts = new Map<string, Attempt>()

async function clientKey() {
  const h = await headers()
  return h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip") || "unknown"
}

async function readAttempt(key: string): Promise<Attempt> {
  const { data, error } = await supabaseAdmin()
    .from("admin_login_attempts")
    .select("failures, locked_until")
    .eq("key", key)
    .maybeSingle()
  if (error) return memoryAttempts.get(key) ?? { failures: 0, lockedUntil: 0 }
  return {
    failures: data?.failures ?? 0,
    lockedUntil: data?.locked_until ? new Date(data.locked_until).getTime() : 0,
  }
}

async function writeAttempt(key: string, attempt: Attempt) {
  memoryAttempts.set(key, attempt)
  await supabaseAdmin()
    .from("admin_login_attempts")
    .upsert({
      key,
      failures: attempt.failures,
      locked_until: attempt.lockedUntil ? new Date(attempt.lockedUntil).toISOString() : null,
      updated_at: new Date().toISOString(),
    })
}

async function clearAttempt(key: string) {
  memoryAttempts.delete(key)
  await supabaseAdmin().from("admin_login_attempts").delete().eq("key", key)
}

function lockedMessage(lockedUntil: number) {
  const minutes = Math.max(1, Math.ceil((lockedUntil - Date.now()) / 60000))
  return `Troppi tentativi sbagliati. Riprova tra ${minutes} ${minutes === 1 ? "minuto" : "minuti"}.`
}

export async function signIn(pin: string): Promise<{ ok: true } | { ok: false; error: string }> {
  const expectedPin = process.env.ADMIN_PIN
  if (!expectedPin) return { ok: false, error: "PIN non configurato sul server." }

  const key = await clientKey()
  const attempt = await readAttempt(key)
  const now = Date.now()
  if (attempt.lockedUntil > now) return { ok: false, error: lockedMessage(attempt.lockedUntil) }

  // Dopo la fine di un blocco si riparte da zero.
  const previousFailures = attempt.lockedUntil ? 0 : attempt.failures

  if (!safeEqual(pin.trim(), expectedPin)) {
    const failures = previousFailures + 1
    const locked = failures >= MAX_FAILURES
    await writeAttempt(key, { failures, lockedUntil: locked ? now + LOCK_MS : 0 })
    await new Promise((r) => setTimeout(r, 400))
    if (locked) return { ok: false, error: lockedMessage(now + LOCK_MS) }
    const left = MAX_FAILURES - failures
    return {
      ok: false,
      error: `PIN errato. ${left === 1 ? "Ultimo tentativo" : `Ancora ${left} tentativi`} prima del blocco.`,
    }
  }

  await clearAttempt(key)
  ;(await cookies()).set(COOKIE, sessionValue()!, {
    httpOnly: true,
    secure: true,
    // "none" serve all'anteprima di v0 (iframe); in produzione resta protetto da httpOnly + secure.
    sameSite: "none",
    path: "/admin",
    maxAge: SESSION_DAYS * 24 * 60 * 60,
  })
  return { ok: true }
}

export async function signOut() {
  ;(await cookies()).delete({ name: COOKIE, path: "/admin" })
}
