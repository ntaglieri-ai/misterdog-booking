"use client"

import { useState } from "react"
import useSWR from "swr"
import { ChevronLeft, ChevronRight, Lock, MoveRight, Phone, X } from "lucide-react"
import { getAgenda, cancelAppointmentById, type AdminAppointment, type AgendaDay } from "@/app/admin/actions"
import { ConfirmDialog } from "@/components/confirm-dialog"
import { daySlots, formatMinutes, formatMonth, formatShortDate, monthStart, weekStart } from "@/lib/admin-format"
import { MAX_DOGS_PER_SLOT, SLOT_MINUTES } from "@/lib/config"
import { formatDuration } from "@/lib/services"
import { addDays, formatLongDate } from "@/lib/shop-time"
import { cn } from "@/lib/utils"
import { MoveDialog } from "./move-dialog"

type View = "giorno" | "settimana" | "mese"

async function fetchAgenda([, from, days]: [string, string, number]) {
  const result = await getAgenda({ from, days })
  if (!result.ok) throw new Error(result.error)
  return result.days
}

export function useAgenda(from: string, days: number) {
  return useSWR(["agenda", from, days] as [string, string, number], fetchAgenda, {
    refreshInterval: 60_000,
    revalidateOnFocus: true,
  })
}

function slotUsage(day: AgendaDay, slot: number) {
  const blocked = day.blocks.some((b) => b.start < slot + SLOT_MINUTES && b.end > slot)
  const used = day.appointments.filter((a) => a.start < slot + SLOT_MINUTES && a.end > slot).length
  return { blocked, used }
}

export function AgendaView({
  today,
  date,
  onDateChange,
  notify,
}: {
  today: string
  date: string
  onDateChange: (date: string) => void
  notify: (message: string) => void
}) {
  const [view, setView] = useState<View>("giorno")
  const from = view === "giorno" ? date : view === "settimana" ? weekStart(date) : weekStart(monthStart(date))
  const days = view === "giorno" ? 1 : view === "settimana" ? 6 : 42
  const { data, error, isLoading, mutate } = useAgenda(from, days)
  const [moving, setMoving] = useState<AdminAppointment | null>(null)
  const [cancelling, setCancelling] = useState<AdminAppointment | null>(null)

  const step = view === "giorno" ? 1 : 7
  const label =
    view === "giorno"
      ? formatLongDate(date)
      : view === "mese"
        ? formatMonth(date)
        : `${formatShortDate(from)} – ${formatShortDate(addDays(from, 5))}`
  const shift = (direction: 1 | -1) => onDateChange(view === "mese" ? monthStart(date, direction) : addDays(date, step * direction))

  async function confirmCancel() {
    if (!cancelling) return
    const target = cancelling
    setCancelling(null)
    const result = await cancelAppointmentById(target.id)
    notify(result.ok ? `Appuntamento di ${target.dogName} cancellato` : result.error)
    mutate()
  }

  return (
    <section className="mx-auto max-w-[680px] px-4 py-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="flex rounded-full border border-border bg-card p-1" role="group" aria-label="Vista">
          {(["giorno", "settimana", "mese"] as const).map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => setView(v)}
              aria-pressed={view === v}
              className={cn(
                "rounded-full px-4 py-1.5 text-[13px] font-medium capitalize transition-colors",
                view === v ? "bg-brown text-cream" : "text-warm-gray",
              )}
            >
              {v}
            </button>
          ))}
        </div>
        {date !== today && (
          <button
            type="button"
            onClick={() => onDateChange(today)}
            className="rounded-full border border-border bg-card px-3.5 py-1.5 text-[13px] font-medium text-sage"
          >
            Oggi
          </button>
        )}
      </div>

      <div className="mb-5 flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={() => shift(-1)}
          aria-label="Periodo precedente"
          className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card text-brown"
        >
          <ChevronLeft className="h-5 w-5" aria-hidden="true" />
        </button>
        <label className="relative flex-1 text-center">
          <span className="font-serif text-lg text-brown text-balance">{label}</span>
          <input
            type="date"
            value={date}
            onChange={(e) => e.target.value && onDateChange(e.target.value)}
            aria-label="Scegli una data"
            className="absolute inset-0 cursor-pointer opacity-0"
          />
        </label>
        <button
          type="button"
          onClick={() => shift(1)}
          aria-label="Periodo successivo"
          className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card text-brown"
        >
          <ChevronRight className="h-5 w-5" aria-hidden="true" />
        </button>
      </div>

      {error && (
        <p role="alert" className="rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
          {error.message}
        </p>
      )}
      {isLoading && !data && <p className="py-10 text-center text-sm text-warm-gray">Caricamento…</p>}

      {data && view === "giorno" && (
        <DayTimeline day={data[0]} onMove={setMoving} onCancel={setCancelling} />
      )}
      {data && view === "settimana" && (
        <WeekList
          days={data}
          today={today}
          onOpenDay={(d) => {
            onDateChange(d)
            setView("giorno")
          }}
        />
      )}

      {data && view === "mese" && (
        <MonthGrid
          days={data}
          month={monthStart(date)}
          today={today}
          onOpenDay={(d) => {
            onDateChange(d)
            setView("giorno")
          }}
        />
      )}

      {moving && (
        <MoveDialog
          appointment={moving}
          today={today}
          onClose={() => setMoving(null)}
          onMoved={(message) => {
            setMoving(null)
            notify(message)
            mutate()
          }}
        />
      )}

      <ConfirmDialog
        open={cancelling !== null}
        title="Cancellare l'appuntamento?"
        message={
          cancelling
            ? `${cancelling.dogName} (${cancelling.customerName}) alle ${formatMinutes(cancelling.start)}. Il posto torna subito libero.`
            : ""
        }
        confirmLabel="Cancella"
        cancelLabel="Indietro"
        onConfirm={confirmCancel}
        onCancel={() => setCancelling(null)}
      />
    </section>
  )
}

function OccupancyMeter({ used, blocked }: { used: number; blocked: boolean }) {
  if (blocked) {
    return (
      <span className="flex items-center gap-1 text-[11px] font-medium text-warm-gray">
        <Lock className="h-3 w-3" aria-hidden="true" />
        Bloccato
      </span>
    )
  }
  return (
    <span className="flex items-center gap-1.5" aria-label={`${used} posti occupati su ${MAX_DOGS_PER_SLOT}`}>
      <span className="flex gap-0.5" aria-hidden="true">
        {Array.from({ length: MAX_DOGS_PER_SLOT }, (_, i) => (
          <span
            key={i}
            className={cn(
              "h-2.5 w-2.5 rounded-full",
              i < used ? (used >= MAX_DOGS_PER_SLOT ? "bg-brown" : "bg-amber") : "bg-border",
            )}
          />
        ))}
      </span>
      <span className={cn("text-[11px] tabular-nums", used >= MAX_DOGS_PER_SLOT ? "font-semibold text-brown" : "text-warm-gray")}>
        {used}/{MAX_DOGS_PER_SLOT}
      </span>
    </span>
  )
}

function DayTimeline({
  day,
  onMove,
  onCancel,
}: {
  day: AgendaDay
  onMove: (a: AdminAppointment) => void
  onCancel: (a: AdminAppointment) => void
}) {
  const slots = daySlots(day.date)
  const outside = day.appointments.filter((a) => !slots.some((s) => a.start >= s && a.start < s + SLOT_MINUTES))

  if (!slots.length && !day.appointments.length) {
    return <p className="rounded-2xl border border-border bg-card p-6 text-center text-sm text-warm-gray">Salone chiuso.</p>
  }

  return (
    <div>
      <p className="mb-3 text-[13px] text-warm-gray">
        {day.appointments.length === 0
          ? "Nessun appuntamento."
          : `${day.appointments.length} ${day.appointments.length === 1 ? "appuntamento" : "appuntamenti"}`}
      </p>
      <ol className="flex flex-col">
        {slots.map((slot, i) => {
          const starting = day.appointments.filter((a) => a.start >= slot && a.start < slot + SLOT_MINUTES)
          const { used, blocked } = slotUsage(day, slot)
          const gap = i > 0 && slot - slots[i - 1] > SLOT_MINUTES
          return (
            <li key={slot} className={cn("border-t border-border py-2", gap && "mt-4 border-t-2")}>
              <div className="flex items-center justify-between gap-3">
                <span className="w-12 text-[13px] font-semibold tabular-nums text-brown">{formatMinutes(slot)}</span>
                <OccupancyMeter used={used} blocked={blocked} />
              </div>
              {starting.length > 0 && (
                <div className="mt-2 flex flex-col gap-2 sm:pl-12">
                  {starting.map((a) => (
                    <AppointmentCard key={a.id} appointment={a} onMove={onMove} onCancel={onCancel} />
                  ))}
                </div>
              )}
            </li>
          )
        })}
      </ol>
      {outside.length > 0 && (
        <div className="mt-5 flex flex-col gap-2">
          <h3 className="text-[11px] font-semibold uppercase tracking-wider text-warm-gray">Fuori orario</h3>
          {outside.map((a) => (
            <AppointmentCard key={a.id} appointment={a} onMove={onMove} onCancel={onCancel} />
          ))}
        </div>
      )}
    </div>
  )
}

function AppointmentCard({
  appointment: a,
  onMove,
  onCancel,
}: {
  appointment: AdminAppointment
  onMove: (a: AdminAppointment) => void
  onCancel: (a: AdminAppointment) => void
}) {
  return (
    <article className="rounded-xl border border-border bg-card px-3.5 py-3">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="flex flex-wrap items-baseline gap-x-2">
            <span className="text-[13px] font-semibold tabular-nums text-sage">
              {formatMinutes(a.start)}–{formatMinutes(a.end)}
            </span>
            <h3 className="text-[15px] font-semibold text-brown">{a.dogName}</h3>
            {a.size && (
              <span className="rounded-md bg-amber/15 px-1.5 py-0.5 text-[11px] font-semibold text-sage">
                {a.size}
              </span>
            )}
          </div>
          <p className="mt-0.5 text-[13px] leading-snug text-warm-gray">
            {a.services.map((s) => s.name).join(" + ")} · {formatDuration(a.durationMin)}
          </p>
        </div>
        <div className="flex flex-shrink-0 gap-1">
          <button
            type="button"
            onClick={() => onMove(a)}
            aria-label={`Sposta appuntamento di ${a.dogName}`}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-border text-warm-gray transition-colors hover:border-amber hover:text-sage"
          >
            <MoveRight className="h-4 w-4" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={() => onCancel(a)}
            aria-label={`Cancella appuntamento di ${a.dogName}`}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-border text-warm-gray transition-colors hover:border-destructive hover:text-destructive"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      </div>
      <a
        href={`tel:${a.phone.replace(/[^\d+]/g, "")}`}
        className="mt-2 inline-flex items-center gap-1.5 text-[13px] font-medium text-sage"
      >
        <Phone className="h-3.5 w-3.5" aria-hidden="true" />
        {a.customerName} · {a.phone}
      </a>
    </article>
  )
}

function WeekList({
  days,
  today,
  onOpenDay,
}: {
  days: AgendaDay[]
  today: string
  onOpenDay: (date: string) => void
}) {
  return (
    <ul className="flex flex-col gap-3">
      {days.map((day) => {
        const slots = daySlots(day.date)
        const fullyBlocked = slots.length > 0 && slots.every((s) => slotUsage(day, s).blocked)
        return (
          <li key={day.date}>
            <button
              type="button"
              onClick={() => onOpenDay(day.date)}
              className={cn(
                "w-full rounded-2xl border bg-card p-4 text-left transition-colors hover:border-amber",
                day.date === today ? "border-amber" : "border-border",
              )}
            >
              <div className="mb-2 flex items-baseline justify-between gap-2">
                <span className="font-serif text-base capitalize text-brown">{formatShortDate(day.date)}</span>
                <span className="text-[13px] text-warm-gray">
                  {fullyBlocked
                    ? "Chiuso"
                    : !slots.length
                      ? "Salone chiuso"
                      : `${day.appointments.length} app.`}
                </span>
              </div>
              {slots.length > 0 && (
                <div className="mb-2 flex gap-0.5" aria-hidden="true">
                  {slots.map((s) => {
                    const { used, blocked } = slotUsage(day, s)
                    return (
                      <span
                        key={s}
                        className={cn(
                          "h-3 flex-1 rounded-sm",
                          blocked
                            ? "bg-warm-gray/30"
                            : used >= MAX_DOGS_PER_SLOT
                              ? "bg-brown"
                              : used > 0
                                ? "bg-amber"
                                : "bg-border",
                          used > 0 && used < MAX_DOGS_PER_SLOT && used <= 2 && "opacity-60",
                        )}
                      />
                    )
                  })}
                </div>
              )}
              {day.appointments.length > 0 && (
                <ul className="flex flex-col gap-1">
                  {day.appointments.map((a) => (
                    <li key={a.id} className="flex gap-2 text-[13px]">
                      <span className="w-11 flex-shrink-0 tabular-nums text-sage">{formatMinutes(a.start)}</span>
                      <span className="truncate text-brown">
                        <span className="font-semibold">{a.dogName}</span>
                        <span className="text-warm-gray"> · {a.customerName}</span>
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </button>
          </li>
        )
      })}
    </ul>
  )
}

const weekdayHeads = ["Lun", "Mar", "Mer", "Gio", "Ven", "Sab", "Dom"]

function MonthGrid({
  days,
  month,
  today,
  onOpenDay,
}: {
  days: AgendaDay[]
  month: string
  today: string
  onOpenDay: (date: string) => void
}) {
  const monthPrefix = month.slice(0, 7)
  // Le righe sono lunedì–domenica: si tolgono quelle che non contengono giorni del mese.
  const weeks = Array.from({ length: 6 }, (_, i) => days.slice(i * 7, i * 7 + 7)).filter((w) =>
    w.some((d) => d.date.startsWith(monthPrefix)),
  )
  const total = days
    .filter((d) => d.date.startsWith(monthPrefix))
    .reduce((sum, d) => sum + d.appointments.length, 0)

  return (
    <div>
      <p className="mb-3 text-[13px] text-warm-gray">
        {total === 0 ? "Nessun appuntamento." : `${total} ${total === 1 ? "appuntamento" : "appuntamenti"} nel mese`}
      </p>
      <div className="grid grid-cols-7 gap-1 text-center">
        {weekdayHeads.map((h) => (
          <span key={h} className="pb-1 text-[11px] font-semibold uppercase tracking-wider text-warm-gray">
            {h}
          </span>
        ))}
        {weeks.flat().map((day) => {
          const inMonth = day.date.startsWith(monthPrefix)
          const slots = daySlots(day.date)
          const closed = slots.length === 0 || slots.every((s) => slotUsage(day, s).blocked)
          const count = day.appointments.length
          return (
            <button
              key={day.date}
              type="button"
              onClick={() => onOpenDay(day.date)}
              aria-label={`${formatShortDate(day.date)}: ${closed ? "chiuso" : `${count} appuntamenti`}`}
              className={cn(
                "flex aspect-square flex-col items-center justify-center rounded-xl border text-[13px] transition-colors hover:border-amber",
                day.date === today ? "border-amber" : "border-border",
                closed ? "bg-border/40 text-warm-gray" : "bg-card text-brown",
                !inMonth && "opacity-40",
              )}
            >
              <span className="font-semibold tabular-nums">{Number(day.date.slice(8))}</span>
              {closed ? (
                <Lock className="h-3 w-3 text-warm-gray" aria-hidden="true" />
              ) : count > 0 ? (
                <span className="mt-0.5 rounded-full bg-amber px-1.5 text-[11px] font-semibold tabular-nums text-primary-foreground">
                  {count}
                </span>
              ) : (
                <span className="mt-0.5 h-4" aria-hidden="true" />
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
