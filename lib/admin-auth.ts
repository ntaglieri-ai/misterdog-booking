import "server-only"
import { createHmac, timingSafeEqual } from "node:crypto"
import { cookies, headers } from "next/headers"

const COOKIE = "md_admin"
const SESSION_DAYS = 30
const MAX_FAILURES = 5
const LOCK_MS = 5 * 60 * 1000

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

// Limite tentativi in memoria: basta a frenare chi prova PIN a raffica.
const failures = new Map<string, { count: number; lockedUntil: number }>()

async function clientKey() {
  const h = await headers()
  return h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip") || "unknown"
}

export async function signIn(pin: string): Promise<{ ok: true } | { ok: false; error: string }> {
  const expectedPin = process.env.ADMIN_PIN
  if (!expectedPin) return { ok: false, error: "PIN non configurato sul server." }

  const key = await clientKey()
  const entry = failures.get(key)
  if (entry && entry.lockedUntil > Date.now()) {
    return { ok: false, error: "Troppi tentativi. Riprova tra qualche minuto." }
  }

  if (!safeEqual(pin.trim(), expectedPin)) {
    const count = (entry?.count ?? 0) + 1
    failures.set(key, {
      count: count >= MAX_FAILURES ? 0 : count,
      lockedUntil: count >= MAX_FAILURES ? Date.now() + LOCK_MS : 0,
    })
    await new Promise((r) => setTimeout(r, 400))
    return { ok: false, error: "PIN errato." }
  }

  failures.delete(key)
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
