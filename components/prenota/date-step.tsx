"use client"

import { useMemo } from "react"
import useSWR from "swr"
import { Loader2, MessageCircle, Phone } from "lucide-react"
import { getAvailableTimes } from "@/app/prenota/actions"
import { formatMinutes, isClosedDay } from "@/lib/availability"
import { BOOKING_DAYS_AHEAD } from "@/lib/config"
import { contact, dayNames, monthNames } from "@/lib/booking-data"
import { addDays, shopNow } from "@/lib/shop-time"

type DateStepProps = {
  serviceIds: string[]
  selectedDate: string | null
  selectedStart: number | null
  onSelectDate: (date: string) => void
  onSelectStart: (start: number) => void
  notice?: string | null
}

export function DateStep({
  serviceIds,
  selectedDate,
  selectedStart,
  onSelectDate,
  onSelectStart,
  notice,
}: DateStepProps) {
  const days = useMemo(() => {
    const today = shopNow().date
    return Array.from({ length: BOOKING_DAYS_AHEAD + 1 }, (_, i) => {
      const date = addDays(today, i)
      const [y, m, d] = date.split("-").map(Number)
      const dow = new Date(Date.UTC(y, m - 1, d)).getUTCDay()
      return { date, name: dayNames[dow], num: d, month: monthNames[m - 1], closed: isClosedDay(date) }
    })
  }, [])

  const { data, isLoading } = useSWR(
    selectedDate ? ["availability", selectedDate, ...serviceIds] : null,
    () => getAvailableTimes({ date: selectedDate!, serviceIds }),
    { revalidateOnFocus: true, refreshInterval: 60_000 },
  )

  return (
    <section className="flex flex-col gap-5">
      <div>
        <h2 className="mb-3 font-display text-xl text-c-brown">Scegli il giorno</h2>
        <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none]">
          {days.map((day) => {
            const active = selectedDate === day.date
            return (
              <button
                key={day.date}
                type="button"
                disabled={day.closed}
                aria-pressed={active}
                aria-label={`${day.name} ${day.num} ${day.month}${day.closed ? " (chiuso)" : ""}`}
                onClick={() => onSelectDate(day.date)}
                className={[
                  "flex min-w-14 flex-shrink-0 flex-col items-center rounded-xl border px-3 py-2.5 transition-colors",
                  day.closed && "cursor-not-allowed opacity-35",
                  active
                    ? "border-c-amber bg-c-amber text-white"
                    : "border-c-border bg-white text-c-brown hover:border-c-amber",
                ]
                  .filter(Boolean)
                  .join(" ")}
              >
                <span className="text-[10px] font-medium uppercase opacity-70">{day.name}</span>
                <span className="text-lg font-semibold">{day.num}</span>
                <span className="text-[10px] opacity-70">{day.month}</span>
              </button>
            )
          })}
        </div>
      </div>

      {notice && (
        <p role="alert" className="rounded-xl border border-c-amber/40 bg-c-amber-pale px-4 py-3 text-sm font-medium text-c-brown">
          {notice}
        </p>
      )}

      {selectedDate && (
        <div>
          <h2 className="mb-3 font-display text-xl text-c-brown">Orari disponibili</h2>
          {isLoading || !data ? (
            <p className="flex items-center gap-2 text-sm text-c-gray">
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              Carico gli orari...
            </p>
          ) : !data.ok ? (
            <p role="alert" className="text-sm text-c-brown">{data.error}</p>
          ) : data.starts.length === 0 ? (
            <FullDay />
          ) : (
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
              {data.starts.map((start) => {
                const active = selectedStart === start
                return (
                  <button
                    key={start}
                    type="button"
                    aria-pressed={active}
                    onClick={() => onSelectStart(start)}
                    className={[
                      "rounded-[10px] border p-2.5 text-center text-sm font-medium transition-colors",
                      active
                        ? "border-c-amber bg-c-amber text-white"
                        : "border-c-border bg-white text-c-brown hover:border-c-amber",
                    ].join(" ")}
                  >
                    {formatMinutes(start)}
                  </button>
                )
              })}
            </div>
          )}
        </div>
      )}
    </section>
  )
}

function FullDay() {
  return (
    <div className="rounded-[14px] border border-c-amber/40 bg-c-amber-pale p-4">
      <p className="mb-3 text-center text-sm font-medium text-c-brown">
        Nessun orario libero per questo servizio.
        <br />
        Scegli un altro giorno o contatta Clara.
      </p>
      <div className="flex gap-2.5">
        <a
          href={contact.phoneHref}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-c-brown px-3 py-2.5 text-[13px] font-semibold text-white transition-opacity hover:opacity-90"
        >
          <Phone className="h-4 w-4" aria-hidden="true" />
          Chiama
        </a>
        <a
          href={contact.whatsappHref}
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-c-sage px-3 py-2.5 text-[13px] font-semibold text-white transition-opacity hover:opacity-90"
        >
          <MessageCircle className="h-4 w-4" aria-hidden="true" />
          WhatsApp
        </a>
      </div>
    </div>
  )
}
