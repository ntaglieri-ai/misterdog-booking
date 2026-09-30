import "server-only"

type TokenCache = { token: string; expiresAt: number }
let cached: TokenCache | null = null

function baseUrl() {
  const url = process.env.POCKETBASE_URL
  if (!url) throw new Error("POCKETBASE_URL non configurato")
  return url.replace(/\/+$/, "")
}

async function authToken(): Promise<string | null> {
  const identity = process.env.POCKETBASE_SUPERUSER_EMAIL
  const password = process.env.POCKETBASE_SUPERUSER_PASSWORD
  if (!identity || !password) return null
  if (cached && cached.expiresAt > Date.now()) return cached.token

  // PocketBase >= 0.23 usa _superusers; le versioni precedenti /api/admins.
  const endpoints = [
    "/api/collections/_superusers/auth-with-password",
    "/api/admins/auth-with-password",
  ]
  for (const path of endpoints) {
    const res = await fetch(baseUrl() + path, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ identity, password }),
      cache: "no-store",
    })
    if (res.status === 404) continue
    if (!res.ok) throw new Error(`Autenticazione PocketBase fallita (${res.status})`)
    const data = (await res.json()) as { token: string }
    cached = { token: data.token, expiresAt: Date.now() + 30 * 60 * 1000 }
    return data.token
  }
  throw new Error("Endpoint di autenticazione PocketBase non trovato")
}

export async function pb<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = await authToken()
  const res = await fetch(baseUrl() + path, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: token } : {}),
      ...init.headers,
    },
    cache: "no-store",
  })
  if (!res.ok) {
    const body = await res.text()
    throw new Error(`PocketBase ${res.status}: ${body.slice(0, 300)}`)
  }
  if (res.status === 204) return undefined as T
  return (await res.json()) as T
}
