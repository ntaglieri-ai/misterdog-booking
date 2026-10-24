"use server"

import { revalidatePath } from "next/cache"
import { isCancelToken } from "@/lib/appointments"
import {
  availableStartsFor,
  clean,
  insertAppointment,
  isDateWithin,
  isSlotStart,
  isValidPhone,
  resolveServices,
} from "@/lib/booking-db"
import { BOOKING_DAYS_AHEAD } from "@/lib/config"
import { isValidPetSize, summarize, type DogSize } from "@/lib/services"
import { supabaseAdmin } from "@/lib/supabase/admin"

export async function getAvailableTimes(input: {
  date: string
  serviceIds: string[]
}): Promise<{ ok: true; starts: number[] } | { ok: false; error: string }> {
  const list = await resolveServices(input.serviceIds)
  if (!list || !isDateWithin(input.date, BOOKING_DAYS_AHEAD)) {
    return { ok: false, error: "Richiesta non valida" }
  }
  try {
    return { ok: true, starts: await availableStartsFor(input.date, summarize(list).durationMin) }
  } catch (error) {
    console.error("[prenota] Errore lettura disponibilità:", error)
    return { ok: false, error: "Impossibile caricare gli orari. Riprova tra poco." }
  }
}

export type CreateAppointmentInput = {
  date: string
  start: number
  size: DogSize | null
  serviceIds: string[]
  customerName: string
  phone: string
  dogName: string
}

export type CreateAppointmentResult =
  | { ok: true; cancelToken: string }
  | { ok: false; error: string; slotTaken?: boolean }

export async function createAppointment(
  input: CreateAppointmentInput,
): Promise<CreateAppointmentResult> {
  const list = await resolveServices(input.serviceIds)
  const customerName = clean(input.customerName, 80)
  const dogName = clean(input.dogName, 60)
  const phone = clean(input.phone, 30)

  if (!list || !isValidPetSize(list, input.size) || !isDateWithin(input.date, BOOKING_DAYS_AHEAD)) {
    return { ok: false, error: "Dati della prenotazione non validi." }
  }
  if (!isSlotStart(input.start)) return { ok: false, error: "Orario non valido." }
  if (customerName.length < 2 || dogName.length < 1) {
    return { ok: false, error: "Inserisci il tuo nome e il nome del cane." }
  }
  if (!isValidPhone(phone)) return { ok: false, error: "Inserisci un numero di telefono valido." }

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
    if (!result.ok) return result
    return { ok: true, cancelToken: result.cancelToken }
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
