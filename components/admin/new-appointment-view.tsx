"use client"

import type React from "react"
import { useMemo, useState } from "react"
import useSWR from "swr"
import { adminCreateAppointment, getAdminTimes } from "@/app/admin/actions"
import { formatMinutes } from "@/lib/admin-format"
import {
  categories,
  catServices,
  formatDuration,
  getBath,
  groomingServices,
  sizes,
  summarize,
  teethServices,
  type DogSize,
} from "@/lib/services"
import { cn } from "@/lib/utils"
import { TimeGrid } from "./time-grid"

const inputClass =
  "w-full rounded-[10px] border border-border bg-card px-3.5 py-2.5 text-sm text-brown outline-none transition-colors focus:border-amber"
const labelClass = "mb-1.5 block text-xs font-medium uppercase tracking-wide text-warm-gray"

export function NewAppointmentView({
  today,
  initialDate,
  notify,
  onSaved,
}: {
  today: string
  initialDate: string
  notify: (message: string) => void
  onSaved: (date: string) => void
}) {
  const [size, setSize] = useState<DogSize | "gatto">("M")
  const isCat = size === "gatto"
  const [primaryId, setPrimaryId] = useState("")
  const [teethId, setTeethId] = useState("")
  const [date, setDate] = useState(initialDate)
  const [start, setStart] = useState<number | null>(null)
  const [customerName, setCustomerName] = useState("")
  const [phone, setPhone] = useState("")
  const [dogName, setDogName] = useState("")
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")

  const primaryOptions = useMemo(
    () => (size === "gatto" ? catServices : [getBath("corto", size), getBath("lungo", size), ...groomingServices]),
    [size],
  )
  const serviceIds = [primaryId, isCat ? "" : teethId].filter(Boolean)
  const selected = [...primaryOptions, ...teethServices].filter((s) => serviceIds.includes(s.id))
  const duration = selected.length ? summarize(selected).durationMin : 0

  const { data: starts, isLoading, mutate } = useSWR(
    primaryId ? ["admin-times", date, serviceIds.join(",")] : null,
    async () => {
      const result = await getAdminTimes({ date, serviceIds })
      if (!result.ok) throw new Error(result.error)
      return result.starts
    },
  )

  function resetTime() {
    setStart(null)
    setError("")
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (start === null) return setError("Scegli un orario.")
    setSaving(true)
    setError("")
    const result = await adminCreateAppointment({
      date,
      start,
      size: isCat ? null : size,
      serviceIds,
      customerName,
      phone,
      dogName,
    })
    setSaving(false)
    if (!result.ok) {
      setError(result.error)
      if (result.slotTaken) {
        setStart(null)
        mutate()
      }
      return
    }
    notify(`Appuntamento di ${dogName.trim()} salvato`)
    onSaved(date)
  }

  return (
    <section className="mx-auto max-w-[600px] px-4 py-5">
      <h1 className="font-serif text-xl text-brown">Nuovo appuntamento</h1>
      <p className="mb-5 text-[13px] text-warm-gray">Per chi chiama o passa in negozio.</p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <fieldset className="rounded-2xl border border-border bg-card p-4">
          <legend className="sr-only">Animale e servizio</legend>

          <span className={labelClass}>Taglia cane o gatto</span>
          <div className="mb-4 grid grid-cols-3 gap-2 sm:grid-cols-6" role="radiogroup" aria-label="Taglia cane o gatto">
            {[...sizes.map((s) => s.id), "gatto" as const].map((id) => (
              <button
                key={id}
                type="button"
                role="radio"
                aria-checked={size === id}
                onClick={() => {
                  const switchingPet = (id === "gatto") !== isCat
                  setSize(id)
                  if (switchingPet || primaryId.startsWith("bagno-")) setPrimaryId("")
                  if (id === "gatto") setTeethId("")
                  resetTime()
                }}
                className={cn(
                  "rounded-lg border py-2.5 text-sm font-semibold transition-colors",
                  size === id ? "border-brown bg-brown text-cream" : "border-border text-brown hover:border-amber",
                )}
              >
                {id === "gatto" ? "Gatto" : id}
              </button>
            ))}
          </div>

          <label htmlFor="primary" className={labelClass}>
            Servizio
          </label>
          <select
            id="primary"
            required
            value={primaryId}
            onChange={(e) => {
              setPrimaryId(e.target.value)
              resetTime()
            }}
            className={cn(inputClass, "mb-4")}
          >
            <option value="">Scegli…</option>
            {categories
              .filter((c) => c.id !== "denti")
              .map((c) => {
                const options = primaryOptions.filter((s) => s.category === c.id)
                if (!options.length) return null
                return (
                  <optgroup key={c.id} label={c.label}>
                    {options.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} · {formatDuration(s.durationMin)}
                      </option>
                    ))}
                  </optgroup>
                )
              })}
          </select>

          {!isCat && (
            <>
              <label htmlFor="teeth" className={labelClass}>
                Pulizia denti (facoltativa)
              </label>
              <select
                id="teeth"
                value={teethId}
                onChange={(e) => {
                  setTeethId(e.target.value)
                  resetTime()
                }}
                className={inputClass}
              >
                <option value="">Nessuna</option>
                {teethServices.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} · {formatDuration(s.durationMin)}
                  </option>
                ))}
              </select>
            </>
          )}

          {duration > 0 && (
            <p className="mt-3 text-[13px] text-warm-gray">
              Durata totale: <span className="font-semibold text-brown">{formatDuration(duration)}</span>
            </p>
          )}
        </fieldset>

        <fieldset className="rounded-2xl border border-border bg-card p-4">
          <legend className="sr-only">Data e ora</legend>
          <label htmlFor="date" className={labelClass}>
            Giorno
          </label>
          <input
            id="date"
            type="date"
            required
            min={today}
            value={date}
            onChange={(e) => {
              if (!e.target.value) return
              setDate(e.target.value)
              resetTime()
            }}
            className={cn(inputClass, "mb-4")}
          />
          <span className={labelClass}>Orario</span>
          {primaryId ? (
            <TimeGrid starts={starts} loading={isLoading} selected={start} onSelect={setStart} />
          ) : (
            <p className="rounded-xl bg-muted px-4 py-3 text-sm text-warm-gray">Scegli prima il servizio.</p>
          )}
        </fieldset>

        <fieldset className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-4">
          <legend className="sr-only">Cliente</legend>
          <div>
            <label htmlFor="dog" className={labelClass}>
              {isCat ? "Nome del gatto" : "Nome del cane"}
            </label>
            <input id="dog" required maxLength={60} value={dogName} onChange={(e) => setDogName(e.target.value)} className={inputClass} />
          </div>
          <div>
            <label htmlFor="customer" className={labelClass}>
              Nome del cliente
            </label>
            <input
              id="customer"
              required
              minLength={2}
              maxLength={80}
              autoComplete="off"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor="phone" className={labelClass}>
              Telefono
            </label>
            <input
              id="phone"
              type="tel"
              required
              inputMode="tel"
              autoComplete="off"
              placeholder="347 123 4567"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className={inputClass}
            />
          </div>
        </fieldset>

        {error && (
          <p role="alert" className="text-sm text-destructive">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={saving}
          className="rounded-xl bg-brown py-3.5 text-sm font-semibold text-cream transition-opacity disabled:opacity-50"
        >
          {saving ? "Salvataggio…" : start === null ? "Salva appuntamento" : `Salva alle ${formatMinutes(start)}`}
        </button>
      </form>
    </section>
  )
}
