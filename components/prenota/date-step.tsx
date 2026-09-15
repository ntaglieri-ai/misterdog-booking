"use client"

import { useMemo, useState } from "react"
import { Phone, MessageCircle } from "lucide-react"
import { allTimes, busyTimes, buildDays, contact } from "@/lib/booking-data"

type DateStepProps = {
  selectedDay: string | null
  selectedTime: string | null
  onSelectDay: (label: string) => void
  onSelectTime: (time: string) => void
}

export function DateStep({
  selectedDay,
  selectedTime,
  onSelectDay,
  onSelectTime,
}: DateStepProps) {
  const days = useMemo(() => buildDays(10), [])
  const [fullDayLabel, setFullDayLabel] = useState<string | null>(null)

  return (
    <div className="rounded-[18px] border border-c-border bg-white p-5">
      <h2 className="mb-3.5 font-display text-[17px] text-c-brown">
        Scegli il giorno
      </h2>
      <div className="mb-4 flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none]">
        {days.map((day, i) => {
          const isSelected = selectedDay === day.label
          const isFullSelected = fullDayLabel === day.label
          return (
            <button
              key={i}
              type="button"
              disabled={day.disabled}
              onClick={() => {
                if (day.full) {
                  setFullDayLabel((prev) => (prev === day.label ? null : day.label))
                  return
                }
                setFullDayLabel(null)
                onSelectDay(day.label)
              }}
              aria-pressed={isSelected || isFullSelected}
              className={[
                "flex flex-shrink-0 flex-col items-center rounded-xl border px-3.5 py-2.5 transition-colors",
                day.disabled && "pointer-events-none opacity-35",
                day.full
                  ? isFullSelected
                    ? "border-c-gray bg-[#ececec] text-c-gray"
                    : "border-c-border bg-[#f5f5f5] text-[#bdbdbd]"
                  : isSelected
                    ? "border-c-amber bg-c-amber text-white"
                    : "border-c-border bg-white text-c-brown",
              ]
                .filter(Boolean)
                .join(" ")}
            >
              <span className="text-[10px] font-medium opacity-70">{day.name}</span>
              <span className="my-0.5 text-lg font-semibold">{day.num}</span>
              <span
                className={[
                  "h-1 w-1 rounded-full",
                  day.full
                    ? "bg-transparent"
                    : isSelected
                      ? "bg-white"
                      : "bg-c-sage",
                ].join(" ")}
                aria-hidden="true"
              />
            </button>
          )
        })}
      </div>

      {fullDayLabel && (
        <div className="mb-4 rounded-[14px] border border-c-amber/40 bg-c-amber-pale p-4">
          <p className="mb-3 text-center text-[14px] font-medium text-c-brown">
            Giorno completo <span aria-hidden="true">🐾</span>
            <br />
            Contatta Clara per disponibilità
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
      )}

      <h2 className="mb-3.5 font-display text-[17px] text-c-brown">
        Orario disponibile
      </h2>
      <div className="grid grid-cols-3 gap-2">
        {allTimes.map((time) => {
          const busy = busyTimes.includes(time)
          const isSelected = selectedTime === time
          return (
            <button
              key={time}
              type="button"
              disabled={busy}
              onClick={() => onSelectTime(time)}
              className={[
                "rounded-[10px] border p-2.5 text-center text-[13px] font-medium transition-colors",
                busy && "pointer-events-none bg-[#f5f5f5] text-[#bdbdbd] line-through",
                isSelected
                  ? "border-c-amber bg-c-amber text-white"
                  : !busy &&
                    "border-c-border bg-white text-c-brown hover:border-c-amber hover:text-c-amber",
              ]
                .filter(Boolean)
                .join(" ")}
            >
              {time}
            </button>
          )
        })}
      </div>
    </div>
  )
}
