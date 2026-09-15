"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { Plus } from "lucide-react"
import { AppHeader } from "@/components/app-header"
import { NavTabs, type Section } from "@/components/nav-tabs"
import { AgendaSection } from "@/components/agenda-section"
import { PrenotaSection } from "@/components/prenota-section"
import { ClientiSection } from "@/components/clienti-section"
import { Toast } from "@/components/toast"
import type { Appointment, DayPart } from "@/lib/data"
import {
  deleteAppointmentById,
  fetchAppointments,
  saveAppointment,
} from "@/lib/appointments-actions"

function toMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number)
  return h * 60 + (m || 0)
}

function partLabelForTime(time: string): DayPart["label"] {
  return toMinutes(time) < 13 * 60 ? "Mattina" : "Pomeriggio"
}

function buildParts(appointments: Appointment[]): DayPart[] {
  const sorted = [...appointments].sort((a, b) => toMinutes(a.time) - toMinutes(b.time))
  return [
    { label: "Mattina", appointments: sorted.filter((a) => partLabelForTime(a.time) === "Mattina") },
    { label: "Pomeriggio", appointments: sorted.filter((a) => partLabelForTime(a.time) === "Pomeriggio") },
  ]
}

export default function AdminPage() {
  const [section, setSection] = useState<Section>("agenda")
  const [parts, setParts] = useState<DayPart[]>([
    { label: "Mattina", appointments: [] },
    { label: "Pomeriggio", appointments: [] },
  ])
  const [editing, setEditing] = useState<Appointment | null>(null)
  const [toast, setToast] = useState({ message: "", show: false })
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const showToast = useCallback((message: string) => {
    setToast({ message, show: true })
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    timeoutRef.current = setTimeout(() => {
      setToast((t) => ({ ...t, show: false }))
    }, 2500)
  }, [])

  useEffect(() => {
    fetchAppointments()
      .then((appointments) => setParts(buildParts(appointments)))
      .catch(() => showToast("Errore nel caricamento dell'agenda"))
  }, [showToast])

  const handleDelete = useCallback(
    async (id: string) => {
      setParts((prev) =>
        prev.map((part) => ({
          ...part,
          appointments: part.appointments.filter((appt) => appt.id !== id),
        })),
      )
      try {
        await deleteAppointmentById(id)
        showToast("Appuntamento eliminato")
      } catch {
        showToast("Errore durante l'eliminazione")
      }
    },
    [showToast],
  )

  const handleEdit = useCallback((appt: Appointment) => {
    setEditing(appt)
    setSection("prenota")
  }, [])

  const openNewAppointment = useCallback(() => {
    setEditing(null)
    setSection("prenota")
  }, [])

  const handleFormSubmit = useCallback(
    async (appointment: Appointment) => {
      try {
        await saveAppointment(appointment)
      } catch {
        showToast("Errore nel salvataggio")
        return
      }
      setParts((prev) => {
        const withoutAppointment = prev.flatMap((part) => part.appointments).filter(
          (a) => a.id !== appointment.id,
        )
        return buildParts([...withoutAppointment, appointment])
      })
      showToast(editing ? "Modifiche salvate!" : "Appuntamento salvato!")
      setEditing(null)
      setSection("agenda")
    },
    [editing, showToast],
  )

  return (
    <div className="min-h-screen bg-background text-foreground">
      <AppHeader />
      <NavTabs
        active={section}
        onChange={(s) => {
          if (s !== "prenota") setEditing(null)
          setSection(s)
        }}
      />

      <main>
        {section === "agenda" && (
          <AgendaSection parts={parts} onEdit={handleEdit} onDelete={handleDelete} />
        )}
        {section === "prenota" && (
          <PrenotaSection editing={editing} onSubmit={handleFormSubmit} />
        )}
        {section === "clienti" && (
          <ClientiSection onOpenProfile={() => showToast("Profilo aperto")} />
        )}
      </main>

      <button
        type="button"
        onClick={openNewAppointment}
        aria-label="Nuovo appuntamento"
        className="fixed bottom-6 right-5 z-[150] flex h-[52px] w-[52px] items-center justify-center rounded-full bg-amber text-primary-foreground shadow-[0_4px_16px_rgba(77,184,232,0.45)] transition-transform hover:scale-105"
      >
        <Plus className="h-6 w-6" aria-hidden="true" />
      </button>

      <Toast message={toast.message} show={toast.show} />
    </div>
  )
}
