"use client"

import { useState } from "react"
import { Check, MessageCircle, X } from "lucide-react"
import { setNotified, type AdminAppointment } from "@/app/admin/actions"
import { closureMessage, formatMinutes, whatsAppLink } from "@/lib/admin-format"
import { formatLongDate } from "@/lib/shop-time"
import { cn } from "@/lib/utils"

export function NotifyList({
  date,
  appointments,
  notify,
  onClose,
}: {
  date: string
  appointments: AdminAppointment[]
  notify: (m: string) => void
  onClose: () => void
}) {
  const [done, setDone] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(appointments.map((a) => [a.id, a.notified])),
  )
  const bookingUrl = typeof window === "undefined" ? "/prenota" : `${window.location.origin}/prenota`
  const count = Object.values(done).filter(Boolean).length

  async function toggle(id: string, value: boolean) {
    setDone((d) => ({ ...d, [id]: value }))
    const result = await setNotified(id, value)
    if (!result.ok) {
      setDone((d) => ({ ...d, [id]: !value }))
      notify(result.error)
    }
  }

  return (
    <div className="rounded-2xl border border-amber bg-card p-4" aria-live="polite">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <h2 className="text-[15px] font-semibold text-brown">Clienti da avvisare</h2>
          <p className="text-[13px] text-warm-gray">
            {formatLongDate(date)} · {count}/{appointments.length} avvisati
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Chiudi lista"
          className="flex h-8 w-8 items-center justify-center rounded-full text-warm-gray hover:bg-muted"
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>

      {appointments.length === 0 ? (
        <p className="text-sm text-warm-gray">Nessun appuntamento in questo giorno.</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {appointments.map((a) => {
            const time = formatMinutes(a.start)
            const isDone = Boolean(done[a.id])
            return (
              <li
                key={a.id}
                className={cn(
                  "flex flex-col gap-2.5 rounded-xl border px-3.5 py-3 sm:flex-row sm:items-center sm:justify-between",
                  isDone ? "border-border bg-muted/60" : "border-border",
                )}
              >
                <div className="min-w-0">
                  <div className="text-sm font-semibold text-brown">
                    {time} · {a.dogName}
                  </div>
                  <div className="text-[13px] text-warm-gray">
                    {a.customerName} · {a.phone}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <a
                    href={whatsAppLink(
                      a.phone,
                      closureMessage({ customerName: a.customerName, dogName: a.dogName, time, bookingUrl }),
                    )}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-sage px-3 py-2 text-[13px] font-semibold text-cream sm:flex-none"
                  >
                    <MessageCircle className="h-4 w-4" aria-hidden="true" />
                    Avvisa su WhatsApp
                  </a>
                  <label
                    className={cn(
                      "flex cursor-pointer items-center gap-1.5 rounded-lg border px-3 py-2 text-[13px] font-medium",
                      isDone ? "border-brown bg-brown text-cream" : "border-border text-brown",
                    )}
                  >
                    <input
                      type="checkbox"
                      checked={isDone}
                      onChange={(e) => toggle(a.id, e.target.checked)}
                      className="sr-only"
                    />
                    <Check className={cn("h-4 w-4", !isDone && "opacity-30")} aria-hidden="true" />
                    avvisato
                  </label>
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
