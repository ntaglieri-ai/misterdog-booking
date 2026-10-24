import "server-only"
import { randomBytes, randomUUID } from "node:crypto"
import { getAvailableStarts, type BookedInterval } from "@/lib/availability"
import { MAX_DOGS_PER_SLOT, SLOT_MINUTES } from "@/lib/config"
import { loadCatalog } from "@/lib/catalog"
import { summarize, type CatalogService, type DogSize } from "@/lib/services"
import { addDays, shopNow, shopTimeToUtc, utcToShopMinutes } from "@/lib/shop-time"
import { supabaseAdmin } from "@/lib/supabase/admin"

export const DATE_RE = /^\d{4}-\d{2}-\d{2}$/

export type Interval = BookedInterval & { id: string }

export async function resolveServices(serviceIds: unknown): Promise<CatalogService[] | null> {
  if (!Array.isArray(serviceIds) || serviceIds.length === 0 || serviceIds.length > 3) return null
  const { getService } = await loadCatalog()
  const list = serviceIds.map((id) => (typeof id === "string" ? getService(id) : undefined))
  if (list.some((s) => !s)) return null
  const resolved = list as CatalogService[]
  const primary = resolved.filter((s) => s.category !== "denti")
  const teeth = resolved.filter((s) => s.category === "denti")
  if (primary.length !== 1 || teeth.length > 1) return null
  return resolved
}

export function isDateWithin(date: unknown, daysAhead: number): date is string {
  if (typeof date !== "string" || !DATE_RE.test(date)) return false
  const today = shopNow().date
  return date >= today && date <= addDays(today, daysAhead)
}

export function clean(value: unknown, max: number) {
  return typeof value === "string" ? value.trim().replace(/\s+/g, " ").slice(0, max) : ""
}

export function isValidPhone(phone: string) {
  const digits = phone.replace(/[^\d]/g, "")
  return /^\+?[\d\s./-]+$/.test(phone) && digits.length >= 8 && digits.length <= 15
}

export function dayBounds(date: string) {
  return {
    start: shopTimeToUtc(date, 0).toISOString(),
    end: shopTimeToUtc(addDays(date, 1), 0).toISOString(),
  }
}

/** Intervalli occupati del giorno (appuntamenti confermati + blocchi). Nessun dato personale. */
export async function loadDay(date: string, excludeId?: string): Promise<Interval[]> {
  const { start, end } = dayBounds(date)
  const db = supabaseAdmin()

  const [appointments, blocked] = await Promise.all([
    db
      .from("appointments")
      .select("id, start_at, end_at")
      .eq("status", "confermato")
      .lt("start_at", end)
      .gt("end_at", start),
    db.from("blocked_slots").select("id, start_at, end_at").lt("start_at", end).gt("end_at", start),
  ])
  if (appointments.error) throw new Error(appointments.error.message)
  if (blocked.error) throw new Error(blocked.error.message)

  const toInterval = (r: { id: string; start_at: string; end_at: string }): Interval => ({
    id: r.id,
    start: utcToShopMinutes(new Date(r.start_at), date),
    end: utcToShopMinutes(new Date(r.end_at), date),
  })

  // Un blocco di Clara occupa l'intera capienza dello slot.
  const blockedIntervals = blocked.data.flatMap((r) =>
    Array.from({ length: MAX_DOGS_PER_SLOT }, () => toInterval(r)),
  )
  const booked = appointments.data.filter((a) => a.id !== excludeId).map(toInterval)
  return [...booked, ...blockedIntervals]
}

export function availabilityFor(date: string, durationMin: number, appointments: BookedInterval[]) {
  const now = shopNow()
  return getAvailableStarts({
    date,
    durationMin,
    appointments,
    notBefore: date === now.date ? now.minutes + 1 : 0,
  })
}

export async function availableStartsFor(date: string, durationMin: number, excludeId?: string) {
  return availabilityFor(date, durationMin, await loadDay(date, excludeId))
}

export type NewAppointment = {
  date: string
  start: number
  size: DogSize | null
  services: CatalogService[]
  customerName: string
  phone: string
  dogName: string
}

export const SLOT_TAKEN = {
  ok: false as const,
  slotTaken: true,
  error: "Orario non più disponibile, scegline un altro.",
}

export function isSlotStart(start: unknown): start is number {
  return typeof start === "number" && Number.isInteger(start) && start % SLOT_MINUTES === 0
}

/**
 * Salva con doppio controllo: prima e dopo l'inserimento. Se due prenotazioni
 * arrivano nello stesso istante, quella che sfora la capienza viene rimossa.
 */
export async function insertAppointment(
  input: NewAppointment,
): Promise<{ ok: true; id: string; cancelToken: string } | typeof SLOT_TAKEN> {
  const { durationMin } = summarize(input.services)
  if (!(await availableStartsFor(input.date, durationMin)).includes(input.start)) return SLOT_TAKEN

  const id = randomUUID()
  const cancelToken = randomBytes(24).toString("base64url")
  const db = supabaseAdmin()
  const { error } = await db.from("appointments").insert({
    // La tabella esistente ha id di tipo testo senza default: lo generiamo qui.
    id,
    date: input.date,
    start_at: shopTimeToUtc(input.date, input.start).toISOString(),
    end_at: shopTimeToUtc(input.date, input.start + durationMin).toISOString(),
    duration_min: durationMin,
    services: input.services.map((s) => ({ id: s.id, name: s.name })),
    size: input.size,
    customer_name: input.customerName,
    phone: input.phone,
    dog_name: input.dogName,
    cancel_token: cancelToken,
  })
  if (error) throw new Error(error.message)

  if (!(await availableStartsFor(input.date, durationMin, id)).includes(input.start)) {
    await db.from("appointments").delete().eq("id", id)
    return SLOT_TAKEN
  }
  return { ok: true, id, cancelToken }
}
