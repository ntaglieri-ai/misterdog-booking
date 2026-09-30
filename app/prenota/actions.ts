"use server"

import { randomBytes } from "node:crypto"
import { getAvailableStarts, type BookedInterval } from "@/lib/availability"
import { BOOKING_DAYS_AHEAD, SLOT_MINUTES } from "@/lib/config"
import { pb } from "@/lib/pocketbase"
import {
  getService,
  isSize,
  summarize,
  type CatalogService,
  type DogSize,
} from "@/lib/services"
import {
  addDays,
  fromPbDate,
  shopNow,
  shopTimeToUtc,
  toPbDate,
  utcToShopMinutes,
} from "@/lib/shop-time"

const COLLECTION = "appointments"
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/

type AppointmentRecord = { id: string; start: string; end: string; status: string }

function resolveServices(serviceIds: unknown): CatalogService[] | null {
  if (!Array.isArray(serviceIds) || serviceIds.length === 0 || serviceIds.length > 3) return null
  const list = serviceIds.map((id) => (typeof id === "string" ? getService(id) : undefined))
  if (list.some((s) => !s)) return null
  const resolved = list as CatalogService[]
  const primary = resolved.filter((s) => s.category !== "denti")
  const teeth = resolved.filter((s) => s.category === "denti")
  if (primary.length !== 1 || teeth.length > 1) return null
  return resolved
}

function isBookableDate(date: unknown): date is string {
  if (typeof date !== "string" || !DATE_RE.test(date)) return false
  const today = shopNow().date
  return date >= today && date <= addDays(today, BOOKING_DAYS_AHEAD)
}

async function loadDay(date: string): Promise<(BookedInterval & { id: string })[]> {
  const dayStart = toPbDate(shopTimeToUtc(date, 0))
  const dayEnd = toPbDate(shopTimeToUtc(addDays(date, 1), 0))
  const filter = `start < "${dayEnd}" && end > "${dayStart}" && status != "cancellato"`
  const params = new URLSearchParams({
    filter,
    perPage: "500",
    fields: "id,start,end,status",
    skipTotal: "1",
  })
  const res = await pb<{ items: AppointmentRecord[] }>(
    `/api/collections/${COLLECTION}/records?${params}`,
  )
  return res.items.map((r) => ({
    id: r.id,
    start: utcToShopMinutes(fromPbDate(r.start), date),
    end: utcToShopMinutes(fromPbDate(r.end), date),
    status: r.status,
  }))
}

function availabilityFor(date: string, durationMin: number, appointments: BookedInterval[]) {
  const now = shopNow()
  return getAvailableStarts({
    date,
    durationMin,
    appointments,
    notBefore: date === now.date ? now.minutes + 1 : 0,
  })
}

export async function getAvailableTimes(input: {
  date: string
  serviceIds: string[]
}): Promise<{ ok: true; starts: number[] } | { ok: false; error: string }> {
  const list = resolveServices(input.serviceIds)
  if (!list || !isBookableDate(input.date)) return { ok: false, error: "Richiesta non valida" }
  try {
    const appointments = await loadDay(input.date)
    return { ok: true, starts: availabilityFor(input.date, summarize(list).durationMin, appointments) }
  } catch (error) {
    console.error("[prenota] Errore lettura disponibilità:", error)
    return { ok: false, error: "Impossibile caricare gli orari. Riprova tra poco." }
  }
}

export type CreateAppointmentInput = {
  date: string
  start: number
  size: DogSize
  serviceIds: string[]
  customerName: string
  phone: string
  dogName: string
}

export type CreateAppointmentResult =
  | { ok: true }
  | { ok: false; error: string; slotTaken?: boolean }

function clean(value: unknown, max: number) {
  return typeof value === "string" ? value.trim().replace(/\s+/g, " ").slice(0, max) : ""
}

export async function createAppointment(
  input: CreateAppointmentInput,
): Promise<CreateAppointmentResult> {
  const list = resolveServices(input.serviceIds)
  const customerName = clean(input.customerName, 80)
  const dogName = clean(input.dogName, 60)
  const phone = clean(input.phone, 30)
  const phoneDigits = phone.replace(/[^\d]/g, "")

  if (!list || !isSize(input.size) || !isBookableDate(input.date)) {
    return { ok: false, error: "Dati della prenotazione non validi." }
  }
  if (!Number.isInteger(input.start) || input.start % SLOT_MINUTES !== 0) {
    return { ok: false, error: "Orario non valido." }
  }
  if (customerName.length < 2 || dogName.length < 1) {
    return { ok: false, error: "Inserisci il tuo nome e il nome del cane." }
  }
  if (!/^\+?[\d\s./-]+$/.test(phone) || phoneDigits.length < 8 || phoneDigits.length > 15) {
    return { ok: false, error: "Inserisci un numero di telefono valido." }
  }

  const { durationMin } = summarize(list)
  const slotTaken = {
    ok: false as const,
    slotTaken: true,
    error: "Orario non più disponibile, scegline un altro.",
  }

  try {
    const before = await loadDay(input.date)
    if (!availabilityFor(input.date, durationMin, before).includes(input.start)) return slotTaken

    const start = shopTimeToUtc(input.date, input.start)
    const end = shopTimeToUtc(input.date, input.start + durationMin)
    const created = await pb<AppointmentRecord>(`/api/collections/${COLLECTION}/records`, {
      method: "POST",
      body: JSON.stringify({
        start: toPbDate(start),
        end: toPbDate(end),
        duration_min: durationMin,
        services: list.map((s) => ({ name: s.name, price: s.priceFrom })),
        size: input.size,
        customer_name: customerName,
        phone,
        dog_name: dogName,
        status: "confermato",
        cancel_token: randomBytes(24).toString("base64url"),
      }),
    })

    // Controllo dopo il salvataggio: se due clienti hanno prenotato lo stesso
    // orario nello stesso istante, chi sfora la capienza viene annullato.
    const others = (await loadDay(input.date)).filter((a) => a.id !== created.id)
    if (!availabilityFor(input.date, durationMin, others).includes(input.start)) {
      await pb(`/api/collections/${COLLECTION}/records/${created.id}`, { method: "DELETE" })
      return slotTaken
    }

    return { ok: true }
  } catch (error) {
    console.error("[prenota] Errore salvataggio appuntamento:", error)
    return { ok: false, error: "Non siamo riusciti a salvare la prenotazione. Riprova." }
  }
}
