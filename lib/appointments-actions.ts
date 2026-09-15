"use server"

import { supabaseServer } from "@/lib/supabase-server"
import type { Appointment } from "@/lib/data"

function today(): string {
  return new Date().toISOString().slice(0, 10)
}

export async function fetchAppointments(): Promise<Appointment[]> {
  const { data, error } = await supabaseServer
    .from("appointments")
    .select("id, time, name, service, owner, phone, accent")
    .eq("date", today())
    .order("time", { ascending: true })

  if (error) throw new Error(error.message)
  return (data ?? []) as Appointment[]
}

export async function saveAppointment(appointment: Appointment): Promise<void> {
  const { error } = await supabaseServer.from("appointments").upsert({
    id: appointment.id,
    time: appointment.time,
    name: appointment.name,
    service: appointment.service,
    owner: appointment.owner,
    phone: appointment.phone,
    accent: appointment.accent,
    date: today(),
  })

  if (error) throw new Error(error.message)
}

export async function deleteAppointmentById(id: string): Promise<void> {
  const { error } = await supabaseServer.from("appointments").delete().eq("id", id)
  if (error) throw new Error(error.message)
}
