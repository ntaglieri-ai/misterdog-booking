"use client"

import type React from "react"
import { useState } from "react"
import useSWR from "swr"
import { AlertTriangle, Trash2, Users } from "lucide-react"
import {
  closeDay,
  createBlock,
  deleteBlock,
  getClosedDayCustomers,
  listBlocks,
  type AdminAppointment,
  type BlockListItem,
} from "@/app/admin/actions"
import { ConfirmDialog } from "@/components/confirm-dialog"
import { formatMinutes, formatShortDate } from "@/lib/admin-format"
import { formatLongDate } from "@/lib/shop-time"
import { cn } from "@/lib/utils"
import { NotifyList } from "./notify-list"

const inputClass =
  "w-full rounded-[10px] border border-border bg-card px-3.5 py-2.5 text-sm text-brown outline-none transition-colors focus:border-amber"
const labelClass = "mb-1.5 block text-xs font-medium uppercase tracking-wide text-warm-gray"

const TIME_OPTIONS = Array.from({ length: (21 - 7) * 2 + 1 }, (_, i) => 7 * 60 + i * 30)

function describeBlock(b: BlockListItem) {
  const wholeDays = b.startMin === 0 && b.endMin === 0
  if (wholeDays) {
    // La fine è la mezzanotte del giorno dopo: l'ultimo giorno chiuso è quello prima.
    const lastDay = new Date(`${b.endDate}T00:00:00Z`)
    lastDay.setUTCDate(lastDay.getUTCDate() - 1)
    const last = lastDay.toISOString().slice(0, 10)
    return last === b.startDate
      ? `${formatShortDate(b.startDate)}, tutto il giorno`
      : `Dal ${formatShortDate(b.startDate)} al ${formatShortDate(last)}`
  }
  return `${formatShortDate(b.startDate)}, ${formatMinutes(b.startMin)}–${formatMinutes(b.endMin)}`
}

export function ClosuresView({ today, notify }: { today: string; notify: (m: string) => void }) {
  const { data: blocks, mutate } = useSWR("admin-blocks", async () => {
    const result = await listBlocks()
    if (!result.ok) throw new Error(result.error)
    return result.blocks
  })

  const [closeDate, setCloseDate] = useState(today)
  const [confirmClose, setConfirmClose] = useState(false)
  const [closing, setClosing] = useState(false)
  const [affected, setAffected] = useState<{ date: string; list: AdminAppointment[] } | null>(null)

  async function doCloseDay() {
    setConfirmClose(false)
    setClosing(true)
    const result = await closeDay(closeDate)
    setClosing(false)
    if (!result.ok) return notify(result.error)
    setAffected({ date: closeDate, list: result.affected })
    notify("Giornata chiusa")
    mutate()
  }

  async function openAffected(date: string) {
    const result = await getClosedDayCustomers(date)
    if (!result.ok) return notify(result.error)
    setAffected({ date, list: result.affected })
  }

  return (
    <section className="mx-auto flex max-w-[600px] flex-col gap-6 px-4 py-5">
      <div>
        <h1 className="font-serif text-xl text-brown">Chiusure</h1>
        <p className="text-[13px] text-warm-gray">Ferie, chiusure e imprevisti. I periodi bloccati spariscono dalla prenotazione online.</p>
      </div>

      <div className="rounded-2xl border border-destructive/30 bg-card p-4">
        <div className="mb-3 flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-destructive" aria-hidden="true" />
          <h2 className="text-[15px] font-semibold text-brown">Chiudi giornata</h2>
        </div>
        <p className="mb-3 text-[13px] leading-relaxed text-warm-gray">
          Per un imprevisto o una malattia: cancella tutti gli appuntamenti del giorno e lo blocca. Poi puoi avvisare i clienti su WhatsApp.
        </p>
        <div className="flex gap-2">
          <input
            type="date"
            aria-label="Giorno da chiudere"
            min={today}
            value={closeDate}
            onChange={(e) => e.target.value && setCloseDate(e.target.value)}
            className={cn(inputClass, "flex-1")}
          />
          <button
            type="button"
            onClick={() => setConfirmClose(true)}
            disabled={closing}
            className="rounded-[10px] bg-destructive px-4 text-sm font-semibold text-white disabled:opacity-50"
          >
            {closing ? "Chiudo…" : "Chiudi"}
          </button>
        </div>
      </div>

      {affected && (
        <NotifyList
          date={affected.date}
          appointments={affected.list}
          notify={notify}
          onClose={() => setAffected(null)}
        />
      )}

      <BlockForm today={today} notify={notify} onCreated={() => mutate()} />

      <div>
        <h2 className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-warm-gray">Periodi bloccati</h2>
        {!blocks ? (
          <p className="text-sm text-warm-gray">Caricamento…</p>
        ) : blocks.length === 0 ? (
          <p className="rounded-2xl border border-border bg-card p-4 text-sm text-warm-gray">Nessun blocco in programma.</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {blocks.map((b) => (
              <li key={b.id} className="flex items-center justify-between gap-3 rounded-xl border border-border bg-card px-4 py-3">
                <div className="min-w-0">
                  <div className="text-sm font-semibold capitalize text-brown">{describeBlock(b)}</div>
                  <div className="text-[13px] text-warm-gray">{b.reason}</div>
                </div>
                <div className="flex flex-shrink-0 gap-1">
                  {b.startMin === 0 && (
                    <button
                      type="button"
                      onClick={() => openAffected(b.startDate)}
                      aria-label={`Clienti da avvisare per ${formatLongDate(b.startDate)}`}
                      className="flex h-9 w-9 items-center justify-center rounded-lg border border-border text-warm-gray hover:border-amber hover:text-sage"
                    >
                      <Users className="h-4 w-4" aria-hidden="true" />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={async () => {
                      const result = await deleteBlock(b.id)
                      notify(result.ok ? "Blocco rimosso" : result.error)
                      mutate()
                    }}
                    aria-label={`Rimuovi blocco ${describeBlock(b)}`}
                    className="flex h-9 w-9 items-center justify-center rounded-lg border border-border text-warm-gray hover:border-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" aria-hidden="true" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <ConfirmDialog
        open={confirmClose}
        title="Chiudere la giornata?"
        message={`${formatLongDate(closeDate)}: tutti gli appuntamenti verranno cancellati e il giorno bloccato.`}
        confirmLabel="Chiudi giornata"
        cancelLabel="Indietro"
        onConfirm={doCloseDay}
        onCancel={() => setConfirmClose(false)}
      />
    </section>
  )
}

function BlockForm({
  today,
  notify,
  onCreated,
}: {
  today: string
  notify: (m: string) => void
  onCreated: () => void
}) {
  const [mode, setMode] = useState<"giorni" | "fascia">("giorni")
  const [fromDate, setFromDate] = useState(today)
  const [toDate, setToDate] = useState(today)
  const [fromMin, setFromMin] = useState(9 * 60)
  const [toMin, setToMin] = useState(13 * 60)
  const [reason, setReason] = useState("")
  const [saving, setSaving] = useState(false)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    const result = await createBlock({
      fromDate,
      toDate: mode === "giorni" ? toDate : fromDate,
      fromMin: mode === "fascia" ? fromMin : null,
      toMin: mode === "fascia" ? toMin : null,
      reason: reason || (mode === "giorni" ? "Ferie" : "Chiuso"),
    })
    setSaving(false)
    notify(result.ok ? "Periodo bloccato" : result.error)
    if (result.ok) {
      setReason("")
      onCreated()
    }
  }

  return (
    <form onSubmit={submit} className="rounded-2xl border border-border bg-card p-4">
      <h2 className="mb-3 text-[15px] font-semibold text-brown">Blocca giorni o fasce orarie</h2>
      <div className="mb-4 flex rounded-full border border-border p-1" role="group" aria-label="Tipo di blocco">
        {(
          [
            ["giorni", "Giorni interi"],
            ["fascia", "Fascia oraria"],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            aria-pressed={mode === id}
            onClick={() => setMode(id)}
            className={cn(
              "flex-1 rounded-full py-1.5 text-[13px] font-medium transition-colors",
              mode === id ? "bg-brown text-cream" : "text-warm-gray",
            )}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="mb-3 grid grid-cols-2 gap-3">
        <div className={mode === "fascia" ? "col-span-2" : undefined}>
          <label htmlFor="block-from" className={labelClass}>
            {mode === "giorni" ? "Dal" : "Giorno"}
          </label>
          <input
            id="block-from"
            type="date"
            required
            min={today}
            value={fromDate}
            onChange={(e) => {
              if (!e.target.value) return
              setFromDate(e.target.value)
              if (toDate < e.target.value) setToDate(e.target.value)
            }}
            className={inputClass}
          />
        </div>
        {mode === "giorni" ? (
          <div>
            <label htmlFor="block-to" className={labelClass}>
              Al
            </label>
            <input
              id="block-to"
              type="date"
              required
              min={fromDate}
              value={toDate}
              onChange={(e) => e.target.value && setToDate(e.target.value)}
              className={inputClass}
            />
          </div>
        ) : (
          <>
            <div>
              <label htmlFor="block-start" className={labelClass}>
                Dalle
              </label>
              <select id="block-start" value={fromMin} onChange={(e) => setFromMin(Number(e.target.value))} className={inputClass}>
                {TIME_OPTIONS.slice(0, -1).map((m) => (
                  <option key={m} value={m}>
                    {formatMinutes(m)}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="block-end" className={labelClass}>
                Alle
              </label>
              <select id="block-end" value={toMin} onChange={(e) => setToMin(Number(e.target.value))} className={inputClass}>
                {TIME_OPTIONS.filter((m) => m > fromMin).map((m) => (
                  <option key={m} value={m}>
                    {formatMinutes(m)}
                  </option>
                ))}
              </select>
            </div>
          </>
        )}
      </div>

      <label htmlFor="block-reason" className={labelClass}>
        Motivo
      </label>
      <input
        id="block-reason"
        maxLength={120}
        placeholder={mode === "giorni" ? "Ferie" : "Chiuso"}
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        className={cn(inputClass, "mb-4")}
      />

      <button
        type="submit"
        disabled={saving}
        className="w-full rounded-xl bg-brown py-3 text-sm font-semibold text-cream disabled:opacity-50"
      >
        {saving ? "Salvataggio…" : "Blocca"}
      </button>
    </form>
  )
}
