"use server"

import { randomUUID } from "node:crypto"
import { redirect } from "next/navigation"
import { requireAdmin, signIn, signOut } from "@/lib/admin-auth"
import {
  DATE_RE,
  availableStartsFor,
  clean,
  dayBounds,
  insertAppointment,
  isDateWithin,
  isSlotStart,
  isValidPhone,
  resolveServices,
} from "@/lib/booking-db"
import { isValidPetSize, summarize, type DogSize } from "@/lib/services"
import { addDays, shopTimeToUtc, utcToShopMinutes } from "@/lib/shop-time"
import { supabaseAdmin } from "@/lib/supabase/admin"

const ADMIN_DAYS_AHEAD = 365
const CLOSE_DAY_REASON = "Chiusura straordinaria"

type Result<T = object> = ({ ok: true } & T) | { ok: false; error: string; slotTaken?: boolean }

function fail(scope: string, error: unknown, message: string): { ok: false; error: string } {
  console.error(`[admin] ${scope}:`, error)
  return { ok: false, error: message }
}

// --- accesso -----------------------------------------------------------------

export async function loginAction(_prev: { error: string } | null, formData: FormData) {
  const result = await signIn(String(formData.get("pin") ?? ""))
  if (!result.ok) return { error: result.error }
  redirect("/admin")
}

export async function logoutAction() {
  await signOut()
  redirect("/admin")
}

// --- agenda ------------------------------------------------------------------

export type AdminAppointment = {
  id: string
  date: string
  start: number
  end: number
  durationMin: number
  services: { id: string; name: string }[]
  size: string
  customerName: string
  phone: string
  dogName: string
  status: "confermato" | "cancellato"
  notified: boolean
}

export type AdminBlock = { id: string; start: number; end: number; reason: string }

export type AgendaDay = { date: string; appointments: AdminAppointment[]; blocks: AdminBlock[] }

type AppointmentRow = {
  id: string
  start_at: string
  end_at: string
  duration_min: number | null
  services: { id: string; name: string }[] | null
  size: string | null
  customer_name: string | null
  phone: string | null
  dog_name: string | null
  status: "confermato" | "cancellato"
  notified_at?: string | null
}

const BASE_COLUMNS =
  "id, start_at, end_at, duration_min, services, size, customer_name, phone, dog_name, status"

/** notified_at arriva con lo script 002: finché manca, le query funzionano lo stesso. */
async function selectAppointments(
  build: (columns: string) => PromiseLike<{ data: unknown; error: { message: string } | null }>,
): Promise<AppointmentRow[]> {
  const withNotified = await build(`${BASE_COLUMNS}, notified_at`)
  if (!withNotified.error) return withNotified.data as AppointmentRow[]
  if (!withNotified.error.message.includes("notified_at")) throw new Error(withNotified.error.message)
  const base = await build(BASE_COLUMNS)
  if (base.error) throw new Error(base.error.message)
  return base.data as AppointmentRow[]
}

function toAdminAppointment(row: AppointmentRow, date: string): AdminAppointment {
  return {
    id: row.id,
    date,
    start: utcToShopMinutes(new Date(row.start_at), date),
    end: utcToShopMinutes(new Date(row.end_at), date),
    durationMin: row.duration_min ?? 0,
    services: row.services ?? [],
    size: row.size ?? "",
    customerName: row.customer_name ?? "",
    phone: row.phone ?? "",
    dogName: row.dog_name ?? "",
    status: row.status,
    notified: Boolean(row.notified_at),
  }
}

export async function getAgenda(input: { from: string; days: number }): Promise<Result<{ days: AgendaDay[] }>> {
  await requireAdmin()
  if (!DATE_RE.test(input.from) || input.days < 1 || input.days > 7) {
    return { ok: false, error: "Intervallo non valido." }
  }
  const dates = Array.from({ length: input.days }, (_, i) => addDays(input.from, i))
  const rangeStart = dayBounds(dates[0]).start
  const rangeEnd = dayBounds(dates[dates.length - 1]).end

  try {
    const db = supabaseAdmin()
    const [rows, blocks] = await Promise.all([
      selectAppointments((columns) =>
        db
          .from("appointments")
          .select(columns)
          .eq("status", "confermato")
          .gte("start_at", rangeStart)
          .lt("start_at", rangeEnd)
          .order("start_at"),
      ),
      db
        .from("blocked_slots")
        .select("id, start_at, end_at, reason")
        .lt("start_at", rangeEnd)
        .gt("end_at", rangeStart),
    ])
    if (blocks.error) throw new Error(blocks.error.message)

    const days = dates.map((date): AgendaDay => {
      const { start, end } = dayBounds(date)
      return {
        date,
        appointments: rows
          .filter((r) => r.start_at >= start && r.start_at < end)
          .map((r) => toAdminAppointment(r, date)),
        blocks: blocks.data
          .filter((b) => b.start_at < end && b.end_at > start)
          .map((b) => ({
            id: b.id,
            start: utcToShopMinutes(new Date(b.start_at), date),
            end: utcToShopMinutes(new Date(b.end_at), date),
            reason: b.reason ?? "",
          })),
      }
    })
    return { ok: true, days }
  } catch (error) {
    return fail("agenda", error, "Impossibile caricare l'agenda.")
  }
}

// --- nuovo / sposta / cancella -----------------------------------------------

export async function getAdminTimes(input: {
  date: string
  serviceIds?: string[]
  appointmentId?: string
}): Promise<Result<{ starts: number[] }>> {
  await requireAdmin()
  if (!isDateWithin(input.date, ADMIN_DAYS_AHEAD)) return { ok: false, error: "Data non valida." }
  try {
    let durationMin: number
    if (input.appointmentId) {
      const { data, error } = await supabaseAdmin()
        .from("appointments")
        .select("duration_min")
        .eq("id", input.appointmentId)
        .single()
      if (error) throw new Error(error.message)
      durationMin = data.duration_min
    } else {
      const list = resolveServices(input.serviceIds)
      if (!list) return { ok: false, error: "Scegli un servizio." }
      durationMin = summarize(list).durationMin
    }
    return { ok: true, starts: await availableStartsFor(input.date, durationMin, input.appointmentId) }
  } catch (error) {
    return fail("orari", error, "Impossibile caricare gli orari.")
  }
}

export async function adminCreateAppointment(input: {
  date: string
  start: number
  size: DogSize | null
  serviceIds: string[]
  customerName: string
  phone: string
  dogName: string
}): Promise<Result> {
  await requireAdmin()
  const list = resolveServices(input.serviceIds)
  const customerName = clean(input.customerName, 80)
  const dogName = clean(input.dogName, 60)
  const phone = clean(input.phone, 30)

  if (!list || !isValidPetSize(list, input.size) || !isDateWithin(input.date, ADMIN_DAYS_AHEAD)) {
    return { ok: false, error: "Controlla taglia, servizio e data." }
  }
  if (!isSlotStart(input.start)) return { ok: false, error: "Scegli un orario." }
  if (customerName.length < 2 || dogName.length < 1) {
    return { ok: false, error: "Inserisci nome del cliente e del cane." }
  }
  if (!isValidPhone(phone)) return { ok: false, error: "Numero di telefono non valido." }

  try {
    const result = await insertAppointment({
      date: input.date,
      start: input.start,
      size: input.size,
      services: list,
      customerName,
      phone,
      dogName,
    })
    return result.ok ? { ok: true } : result
  } catch (error) {
    return fail("nuovo appuntamento", error, "Salvataggio non riuscito. Riprova.")
  }
}

export async function moveAppointment(input: { id: string; date: string; start: number }): Promise<Result> {
  await requireAdmin()
  if (!isDateWithin(input.date, ADMIN_DAYS_AHEAD) || !isSlotStart(input.start)) {
    return { ok: false, error: "Data o orario non validi." }
  }
  const db = supabaseAdmin()
  try {
    const { data: current, error } = await db
      .from("appointments")
      .select("id, date, start_at, end_at, duration_min, status")
      .eq("id", input.id)
      .single()
    if (error) throw new Error(error.message)
    if (current.status !== "confermato") return { ok: false, error: "Appuntamento già cancellato." }

    const duration = current.duration_min as number
    const isFree = async () =>
      (await availableStartsFor(input.date, duration, input.id)).includes(input.start)
    if (!(await isFree())) return { ok: false, slotTaken: true, error: "Orario non più libero." }

    const { error: updateError } = await db
      .from("appointments")
      .update({
        date: input.date,
        start_at: shopTimeToUtc(input.date, input.start).toISOString(),
        end_at: shopTimeToUtc(input.date, input.start + duration).toISOString(),
      })
      .eq("id", input.id)
    if (updateError) throw new Error(updateError.message)

    if (!(await isFree())) {
      await db
        .from("appointments")
        .update({ date: current.date, start_at: current.start_at, end_at: current.end_at })
        .eq("id", input.id)
      return { ok: false, slotTaken: true, error: "Orario appena occupato, scegline un altro." }
    }
    return { ok: true }
  } catch (error) {
    return fail("sposta", error, "Spostamento non riuscito. Riprova.")
  }
}

export async function cancelAppointmentById(id: string): Promise<Result> {
  await requireAdmin()
  try {
    const { error } = await supabaseAdmin()
      .from("appointments")
      .update({ status: "cancellato" })
      .eq("id", id)
    if (error) throw new Error(error.message)
    return { ok: true }
  } catch (error) {
    return fail("cancella", error, "Cancellazione non riuscita. Riprova.")
  }
}

// --- blocchi -----------------------------------------------------------------

export type BlockListItem = {
  id: string
  startDate: string
  startMin: number
  endDate: string
  endMin: number
  reason: string
}

function toShopDateMinutes(iso: string) {
  const instant = new Date(iso)
  const date = new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Rome" }).format(instant)
  return { date, minutes: utcToShopMinutes(instant, date) }
}

export async function listBlocks(): Promise<Result<{ blocks: BlockListItem[] }>> {
  await requireAdmin()
  try {
    const { data, error } = await supabaseAdmin()
      .from("blocked_slots")
      .select("id, start_at, end_at, reason")
      .gt("end_at", new Date().toISOString())
      .order("start_at")
    if (error) throw new Error(error.message)
    return {
      ok: true,
      blocks: data.map((b) => {
        const s = toShopDateMinutes(b.start_at)
        const e = toShopDateMinutes(b.end_at)
        return {
          id: b.id,
          startDate: s.date,
          startMin: s.minutes,
          endDate: e.date,
          endMin: e.minutes,
          reason: b.reason ?? "",
        }
      }),
    }
  } catch (error) {
    return fail("blocchi", error, "Impossibile caricare i blocchi.")
  }
}

async function insertBlock(startAt: Date, endAt: Date, reason: string) {
  const { error } = await supabaseAdmin().from("blocked_slots").insert({
    id: randomUUID(),
    start_at: startAt.toISOString(),
    end_at: endAt.toISOString(),
    reason,
  })
  if (error) throw new Error(error.message)
}

export async function createBlock(input: {
  fromDate: string
  toDate: string
  fromMin: number | null
  toMin: number | null
  reason: string
}): Promise<Result> {
  await requireAdmin()
  const reason = clean(input.reason, 120) || "Chiuso"
  if (!DATE_RE.test(input.fromDate) || !DATE_RE.test(input.toDate) || input.toDate < input.fromDate) {
    return { ok: false, error: "Date non valide." }
  }
  const wholeDays = input.fromMin === null || input.toMin === null
  if (!wholeDays) {
    if (input.fromDate !== input.toDate) return { ok: false, error: "Una fascia oraria vale per un solo giorno." }
    if (!isSlotStart(input.fromMin) || !isSlotStart(input.toMin) || input.toMin! <= input.fromMin!) {
      return { ok: false, error: "Fascia oraria non valida." }
    }
  }
  try {
    await insertBlock(
      shopTimeToUtc(input.fromDate, wholeDays ? 0 : input.fromMin!),
      wholeDays ? shopTimeToUtc(addDays(input.toDate, 1), 0) : shopTimeToUtc(input.toDate, input.toMin!),
      reason,
    )
    return { ok: true }
  } catch (error) {
    return fail("nuovo blocco", error, "Blocco non salvato. Riprova.")
  }
}

export async function deleteBlock(id: string): Promise<Result> {
  await requireAdmin()
  try {
    const { error } = await supabaseAdmin().from("blocked_slots").delete().eq("id", id)
    if (error) throw new Error(error.message)
    return { ok: true }
  } catch (error) {
    return fail("elimina blocco", error, "Eliminazione non riuscita.")
  }
}

// --- chiudi giornata ---------------------------------------------------------

export async function closeDay(date: string): Promise<Result<{ affected: AdminAppointment[] }>> {
  await requireAdmin()
  if (!DATE_RE.test(date)) return { ok: false, error: "Data non valida." }
  const { start, end } = dayBounds(date)
  const db = supabaseAdmin()
  try {
    const { data: existing, error: blockReadError } = await db
      .from("blocked_slots")
      .select("id")
      .eq("start_at", start)
      .eq("end_at", end)
      .eq("reason", CLOSE_DAY_REASON)
    if (blockReadError) throw new Error(blockReadError.message)
    // Il blocco va prima: da questo istante nessun cliente può prenotare quel giorno.
    if (!existing.length) await insertBlock(new Date(start), new Date(end), CLOSE_DAY_REASON)

    const { error } = await db
      .from("appointments")
      .update({ status: "cancellato" })
      .eq("status", "confermato")
      .gte("start_at", start)
      .lt("start_at", end)
    if (error) throw new Error(error.message)

    return getClosedDayCustomers(date)
  } catch (error) {
    return fail("chiudi giornata", error, "Chiusura non riuscita. Riprova.")
  }
}

/** Clienti con appuntamento cancellato in quel giorno: serve a riaprire la lista da avvisare. */
export async function getClosedDayCustomers(date: string): Promise<Result<{ affected: AdminAppointment[] }>> {
  await requireAdmin()
  if (!DATE_RE.test(date)) return { ok: false, error: "Data non valida." }
  const { start, end } = dayBounds(date)
  try {
    const db = supabaseAdmin()
    const rows = await selectAppointments((columns) =>
      db
        .from("appointments")
        .select(columns)
        .eq("status", "cancellato")
        .gte("start_at", start)
        .lt("start_at", end)
        .order("start_at"),
    )
    return { ok: true, affected: rows.map((r) => toAdminAppointment(r, date)) }
  } catch (error) {
    return fail("clienti giornata", error, "Impossibile caricare i clienti.")
  }
}

export async function setNotified(id: string, notified: boolean): Promise<Result> {
  await requireAdmin()
  try {
    const { error } = await supabaseAdmin()
      .from("appointments")
      .update({ notified_at: notified ? new Date().toISOString() : null })
      .eq("id", id)
    if (error) {
      if (error.message.includes("notified_at")) {
        return { ok: false, error: "Manca la colonna 'notified_at': esegui lo script 002." }
      }
      throw new Error(error.message)
    }
    return { ok: true }
  } catch (error) {
    return fail("avvisato", error, "Non salvato. Riprova.")
  }
}

// --- clienti -----------------------------------------------------------------

export type AdminClient = {
  phone: string
  customerName: string
  dogs: string[]
  visits: number
  lastDate: string
  nextDate: string | null
}

export async function listClients(): Promise<Result<{ clients: AdminClient[] }>> {
  await requireAdmin()
  try {
    const { data, error } = await supabaseAdmin()
      .from("appointments")
      .select("customer_name, phone, dog_name, start_at, status")
      .not("phone", "is", null)
      .order("start_at", { ascending: false })
      .limit(2000)
    if (error) throw new Error(error.message)

    const now = new Date().toISOString()
    const byPhone = new Map<string, AdminClient>()
    for (const row of data) {
      const key = String(row.phone).replace(/[^\d]/g, "")
      if (!key) continue
      const date = toShopDateMinutes(row.start_at).date
      const client: AdminClient = byPhone.get(key) ?? {
        phone: row.phone,
        customerName: row.customer_name ?? "",
        dogs: [],
        visits: 0,
        lastDate: "",
        nextDate: null,
      }
      if (row.dog_name && !client.dogs.includes(row.dog_name)) client.dogs.push(row.dog_name)
      if (row.status === "confermato") {
        if (row.start_at >= now) client.nextDate = date
        else {
          client.visits += 1
          if (!client.lastDate) client.lastDate = date
        }
      }
      byPhone.set(key, client)
    }
    const clients = [...byPhone.values()].sort((a, b) => a.customerName.localeCompare(b.customerName, "it"))
    return { ok: true, clients }
  } catch (error) {
    return fail("clienti", error, "Impossibile caricare i clienti.")
  }
}
