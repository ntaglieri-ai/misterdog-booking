"use server"

import { randomBytes, randomUUID } from "node:crypto"
import { revalidatePath } from "next/cache"
import { getAvailableStarts, type BookedInterval } from "@/lib/availability"
import { isCancelToken } from "@/lib/appointments"
import { BOOKING_DAYS_AHEAD, MAX_DOGS_PER_SLOT, SLOT_MINUTES } from "@/lib/config"
import {
  getService,
  isSize,
  summarize,
  type CatalogService,
  type DogSize,
} from "@/lib/services"
import { addDays, shopNow, shopTimeToUtc, utcToShopMinutes } from "@/lib/shop-time"
import { supabaseAdmin } from "@/lib/supabase/admin"

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/

type Interval = BookedInterval & { id: string }

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

/** Legge solo gli intervalli occupati del giorno: nessun nome o telefono. */
async function loadDay(date: string): Promise<Interval[]> {
  const dayStart = shopTimeToUtc(date, 0).toISOString()
  const dayEnd = shopTimeToUtc(addDays(date, 1), 0).toISOString()
  const db = supabaseAdmin()

  const [appointments, blocked] = await Promise.all([
    db
      .from("appointments")
      .select("id, start_at, end_at")
      .eq("status", "confermato")
      .lt("start_at", dayEnd)
      .gt("end_at", dayStart),
    db.from("blocked_slots").select("id, start_at, end_at").lt("start_at", dayEnd).gt("end_at", dayStart),
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
  return [...appointments.data.map(toInterval), ...blockedIntervals]
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
  | { ok: true; cancelToken: string }
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

    const cancelToken = randomBytes(24).toString("base64url")
    const db = supabaseAdmin()
    const { data: created, error } = await db
      .from("appointments")
      .insert({
        // La tabella esistente ha id di tipo testo senza default: lo generiamo qui.
        id: randomUUID(),
        date: input.date,
        start_at: shopTimeToUtc(input.date, input.start).toISOString(),
        end_at: shopTimeToUtc(input.date, input.start + durationMin).toISOString(),
        duration_min: durationMin,
        services: list.map((s) => ({ id: s.id, name: s.name })),
        size: input.size,
        customer_name: customerName,
        phone,
        dog_name: dogName,
        cancel_token: cancelToken,
      })
      .select("id")
      .single()
    if (error) throw new Error(error.message)

    // Controllo dopo il salvataggio: se due clienti hanno prenotato lo stesso
    // orario nello stesso istante, chi sfora la capienza viene rimosso.
    const others = (await loadDay(input.date)).filter((a) => a.id !== created.id)
    if (!availabilityFor(input.date, durationMin, others).includes(input.start)) {
      await db.from("appointments").delete().eq("id", created.id)
      return slotTaken
    }

    return { ok: true, cancelToken }
  } catch (error) {
    console.error("[prenota] Errore salvataggio appuntamento:", error)
    return { ok: false, error: "Non siamo riusciti a salvare la prenotazione. Riprova." }
  }
}

export async function cancelAppointment(
  token: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!isCancelToken(token)) return { ok: false, error: "Link non valido." }
  try {
    const { data, error } = await supabaseAdmin()
      .from("appointments")
      .update({ status: "cancellato" })
      .eq("cancel_token", token)
      .eq("status", "confermato")
      .gt("start_at", new Date().toISOString())
      .select("id")
    if (error) throw new Error(error.message)
    if (!data.length) return { ok: false, error: "Questo appuntamento non si può più annullare." }
    revalidatePath(`/prenota/appuntamento/${token}`)
    return { ok: true }
  } catch (error) {
    console.error("[prenota] Errore annullamento:", error)
    return { ok: false, error: "Non siamo riusciti ad annullare. Riprova o chiamaci." }
  }
}
