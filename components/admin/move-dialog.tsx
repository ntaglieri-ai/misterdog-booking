"use client"

import { useState } from "react"
import useSWR from "swr"
import { X } from "lucide-react"
import { getAdminTimes, moveAppointment, type AdminAppointment } from "@/app/admin/actions"
import { formatMinutes } from "@/lib/admin-format"
import { formatLongDate } from "@/lib/shop-time"
import { TimeGrid } from "./time-grid"

export function MoveDialog({
  appointment,
  today,
  onClose,
  onMoved,
}: {
  appointment: AdminAppointment
  today: string
  onClose: () => void
  onMoved: (message: string) => void
}) {
  const [date, setDate] = useState(appointment.date < today ? today : appointment.date)
  const [start, setStart] = useState<number | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")

  const { data, isLoading, mutate } = useSWR(["move-times", appointment.id, date], async () => {
    const result = await getAdminTimes({ date, appointmentId: appointment.id })
    if (!result.ok) throw new Error(result.error)
    return result.starts
  })

  async function save() {
    if (start === null) return
    setSaving(true)
    setError("")
    const result = await moveAppointment({ id: appointment.id, date, start })
    setSaving(false)
    if (result.ok) {
      onMoved(`${appointment.dogName} spostato a ${formatLongDate(date).toLowerCase()} alle ${formatMinutes(start)}`)
      return
    }
    setError(result.error)
    setStart(null)
    mutate()
  }

  return (
    <div
      className="fixed inset-0 z-[200] flex items-end justify-center bg-black/40 sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="move-title"
      onClick={onClose}
    >
      <div
        className="max-h-[90vh] w-full max-w-[480px] overflow-y-auto rounded-t-2xl border border-border bg-card p-5 shadow-xl sm:rounded-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <h2 id="move-title" className="font-serif text-lg text-brown">
              Sposta {appointment.dogName}
            </h2>
            <p className="text-[13px] text-warm-gray">
              Ora: {formatLongDate(appointment.date)} alle {formatMinutes(appointment.start)}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Chiudi"
            className="flex h-9 w-9 items-center justify-center rounded-full text-warm-gray hover:bg-muted"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        <label htmlFor="move-date" className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-warm-gray">
          Nuova data
        </label>
        <input
          id="move-date"
          type="date"
          min={today}
          value={date}
          onChange={(e) => {
            if (!e.target.value) return
            setDate(e.target.value)
            setStart(null)
          }}
          className="mb-4 w-full rounded-[10px] border border-border bg-card px-3.5 py-2.5 text-sm text-brown outline-none focus:border-amber"
        />

        <TimeGrid starts={data} loading={isLoading} selected={start} onSelect={setStart} />

        {error && (
          <p role="alert" className="mt-3 text-sm text-destructive">
            {error}
          </p>
        )}

        <button
          type="button"
          onClick={save}
          disabled={start === null || saving}
          className="mt-5 w-full rounded-xl bg-brown py-3 text-sm font-semibold text-cream transition-opacity disabled:opacity-40"
        >
          {saving ? "Salvataggio…" : start === null ? "Scegli un orario" : `Sposta alle ${formatMinutes(start)}`}
        </button>
      </div>
    </div>
  )
}
