"use client"

import { useMemo, useState } from "react"
import { Pencil, Phone, Trash2 } from "lucide-react"
import type { Appointment, DayPart } from "@/lib/data"
import { cn } from "@/lib/utils"
import { ConfirmDialog } from "@/components/confirm-dialog"

type AgendaSectionProps = {
  parts: DayPart[]
  onEdit: (appt: Appointment) => void
  onDelete: (id: string) => void
}

export function AgendaSection({ parts, onEdit, onDelete }: AgendaSectionProps) {
  const [pendingDelete, setPendingDelete] = useState<Appointment | null>(null)

  const totalCount = useMemo(
    () => parts.reduce((sum, part) => sum + part.appointments.length, 0),
    [parts],
  )

  function confirmDelete() {
    if (pendingDelete) onDelete(pendingDelete.id)
    setPendingDelete(null)
  }

  return (
    <section className="mx-auto max-w-[600px] px-4 py-5">
      <h1 className="font-serif text-xl text-brown">Buongiorno!</h1>
      <p className="mb-5 text-[13px] text-warm-gray">Oggi, sabato 7 giugno 2025</p>

      <div className="mb-4 grid grid-cols-2 gap-2.5">
        <div className="rounded-2xl border border-border bg-card p-4 text-center">
          <div className="font-serif text-3xl text-amber">{totalCount}</div>
          <div className="mt-0.5 text-xs text-warm-gray">Appuntamenti oggi</div>
        </div>
        <div className="rounded-2xl border border-border bg-card p-4 text-center">
          <div className="font-serif text-3xl text-amber">€340</div>
          <div className="mt-0.5 text-xs text-warm-gray">Incasso previsto</div>
        </div>
      </div>

      {parts.map((part) => (
        <div key={part.label}>
          <h2 className="mb-2 mt-4 text-[11px] font-semibold uppercase tracking-wider text-warm-gray">
            {part.label}
          </h2>
          {part.appointments.map((appt) => (
            <div key={appt.id} className="mb-2.5 flex items-start gap-3">
              <div className="w-[42px] flex-shrink-0 pt-4 text-xs text-warm-gray">
                {appt.time}
              </div>
              <div
                className={cn(
                  "flex-1 rounded-xl border border-border bg-card border-l-[3px] px-3.5 py-3",
                  appt.accent === "sage" ? "border-l-sage" : "border-l-amber",
                )}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-brown">{appt.name}</div>
                    <div className="mt-0.5 text-xs text-warm-gray">{appt.service}</div>
                  </div>
                  <div className="flex flex-shrink-0 gap-1">
                    <button
                      type="button"
                      onClick={() => onEdit(appt)}
                      aria-label={`Modifica appuntamento di ${appt.name}`}
                      className="flex h-8 w-8 items-center justify-center rounded-lg border border-border text-warm-gray transition-colors hover:border-amber hover:text-amber"
                    >
                      <Pencil className="h-4 w-4" aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setPendingDelete(appt)}
                      aria-label={`Elimina appuntamento di ${appt.name}`}
                      className="flex h-8 w-8 items-center justify-center rounded-lg border border-border text-warm-gray transition-colors hover:border-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" aria-hidden="true" />
                    </button>
                  </div>
                </div>
                <div className="mt-1 flex items-center gap-1.5 text-xs text-amber">
                  <Phone className="h-3 w-3" aria-hidden="true" />
                  {appt.owner} · {appt.phone}
                </div>
              </div>
            </div>
          ))}
        </div>
      ))}

      <ConfirmDialog
        open={pendingDelete !== null}
        title="Eliminare l'appuntamento?"
        message={
          pendingDelete
            ? `Stai per eliminare l'appuntamento di ${pendingDelete.name} alle ${pendingDelete.time}. L'operazione non può essere annullata.`
            : ""
        }
        onConfirm={confirmDelete}
        onCancel={() => setPendingDelete(null)}
      />
    </section>
  )
}
