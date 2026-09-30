"use client"

import { useCallback, useRef, useState } from "react"
import { LogOut, Plus } from "lucide-react"
import { logoutAction } from "@/app/admin/actions"
import { AppHeader } from "@/components/app-header"
import { NavTabs, type Section } from "@/components/nav-tabs"
import { Toast } from "@/components/toast"
import { AgendaView } from "./agenda-view"
import { ClientsView } from "./clients-view"
import { ClosuresView } from "./closures-view"
import { NewAppointmentView } from "./new-appointment-view"

export function AdminApp({ today }: { today: string }) {
  const [section, setSection] = useState<Section>("agenda")
  const [agendaDate, setAgendaDate] = useState(today)
  const [toast, setToast] = useState({ message: "", show: false })
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const notify = useCallback((message: string) => {
    setToast({ message, show: true })
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    timeoutRef.current = setTimeout(() => setToast((t) => ({ ...t, show: false })), 2800)
  }, [])

  return (
    <div className="min-h-screen bg-background pb-24 text-foreground">
      <AppHeader
        actions={
          <form action={logoutAction}>
            <button
              type="submit"
              className="flex items-center gap-1.5 rounded-full bg-white/70 px-3 py-1.5 text-xs font-medium text-brown transition-colors hover:bg-white"
            >
              <LogOut className="h-3.5 w-3.5" aria-hidden="true" />
              Esci
            </button>
          </form>
        }
      />
      <NavTabs active={section} onChange={setSection} />

      <main>
        {section === "agenda" && (
          <AgendaView today={today} date={agendaDate} onDateChange={setAgendaDate} notify={notify} />
        )}
        {section === "nuovo" && (
          <NewAppointmentView
            today={today}
            initialDate={agendaDate < today ? today : agendaDate}
            notify={notify}
            onSaved={(date) => {
              setAgendaDate(date)
              setSection("agenda")
            }}
          />
        )}
        {section === "chiusure" && <ClosuresView today={today} notify={notify} />}
        {section === "clienti" && <ClientsView />}
      </main>

      {section === "agenda" && (
        <button
          type="button"
          onClick={() => setSection("nuovo")}
          aria-label="Nuovo appuntamento"
          className="fixed bottom-6 right-5 z-[150] flex h-14 w-14 items-center justify-center rounded-full bg-amber text-primary-foreground shadow-[0_4px_16px_rgba(77,184,232,0.45)] transition-transform hover:scale-105"
        >
          <Plus className="h-6 w-6" aria-hidden="true" />
        </button>
      )}

      <Toast message={toast.message} show={toast.show} />
    </div>
  )
}
