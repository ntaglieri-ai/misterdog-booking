"use client"

import type React from "react"
import { useMemo, useState } from "react"
import { Check, Search, UserPlus } from "lucide-react"
import { allSlots, clients, services, slotDays } from "@/lib/data"
import type { Appointment } from "@/lib/data"
import { cn } from "@/lib/utils"

const inputClass =
  "w-full rounded-[10px] border border-border bg-card px-3.5 py-2.5 text-sm text-brown outline-none transition-colors focus:border-amber"

const labelClass =
  "mb-1.5 block text-xs font-medium uppercase tracking-wide text-warm-gray"

type PrenotaSectionProps = {
  onSubmit: (appointment: Appointment) => void
  editing?: Appointment | null
}

function splitPetName(name: string): { pet: string; breed: string } {
  const [pet, breed] = name.split(" – ")
  return { pet: pet ?? name, breed: breed ?? "" }
}

export function PrenotaSection({ onSubmit, editing }: PrenotaSectionProps) {
  const editingPet = editing ? splitPetName(editing.name) : null

  const [clientMode, setClientMode] = useState<"existing" | "new">(
    editing ? "new" : "existing",
  )
  const [query, setQuery] = useState("")
  const [selectedClient, setSelectedClient] = useState<string | null>(null)
  const [ownerName, setOwnerName] = useState(editing?.owner ?? "")
  const [phone, setPhone] = useState(editing?.phone ?? "")
  const [petName, setPetName] = useState(editingPet?.pet ?? "")
  const [breed, setBreed] = useState(editingPet?.breed ?? "")
  const [dayIndex, setDayIndex] = useState(0)
  const [selectedTime, setSelectedTime] = useState<string | null>(editing?.time ?? null)
  const [selectedServices, setSelectedServices] = useState<string[]>(
    editing
      ? editing.service
          .split("+")
          .map((s) => s.trim())
          .filter(Boolean)
      : [],
  )
  const [error, setError] = useState<string | null>(null)

  const activeDay = slotDays[dayIndex]
  const isDayFull = useMemo(
    () => allSlots.every((slot) => activeDay.occupied.includes(slot)),
    [activeDay],
  )

  const filteredClients = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return clients
    return clients.filter(
      (c) =>
        c.name.toLowerCase().includes(q) || c.pet.toLowerCase().includes(q),
    )
  }, [query])

  function toggleService(service: string) {
    setSelectedServices((prev) =>
      prev.includes(service)
        ? prev.filter((s) => s !== service)
        : [...prev, service],
    )
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (!selectedTime) {
      setError("Seleziona un orario.")
      return
    }
    if (selectedServices.length === 0) {
      setError("Seleziona almeno un servizio.")
      return
    }

    let owner: string
    let ownerPhone: string
    let pet: string
    let petBreed: string

    if (clientMode === "existing") {
      const client = clients.find((c) => c.name === selectedClient)
      if (!client) {
        setError("Seleziona un cliente esistente.")
        return
      }
      owner = client.name
      ownerPhone = client.phone
      pet = client.pet
      petBreed = client.breed
    } else {
      if (!ownerName.trim() || !petName.trim()) {
        setError("Inserisci almeno proprietario e nome animale.")
        return
      }
      owner = ownerName.trim()
      ownerPhone = phone.trim()
      pet = petName.trim()
      petBreed = breed.trim()
    }

    const appointment: Appointment = {
      id: editing?.id ?? `a${Date.now()}`,
      time: selectedTime,
      name: petBreed ? `${pet} – ${petBreed}` : pet,
      service: selectedServices.join(" + "),
      owner,
      phone: ownerPhone,
      accent: editing?.accent ?? "amber",
    }

    onSubmit(appointment)
  }

  return (
    <section className="mx-auto max-w-[600px] px-4 py-5">
      <h1 className="font-serif text-xl text-brown">
        {editing ? "Modifica Appuntamento" : "Nuovo Appuntamento"}
      </h1>
      <p className="mb-5 text-[13px] text-warm-gray">
        {editing
          ? `Stai modificando l'appuntamento di ${editing.name}`
          : "Inserisci i dettagli della prenotazione"}
      </p>

      <form
        onSubmit={handleSubmit}
        className="rounded-2xl border border-border bg-card p-[18px]"
      >
        {/* Cliente: esistente o nuovo */}
        <span className={labelClass}>Cliente</span>
        <div className="mb-3 grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setClientMode("existing")}
            className={cn(
              "flex items-center justify-center gap-1.5 rounded-[10px] border py-2.5 text-[13px] font-medium transition-colors",
              clientMode === "existing"
                ? "border-amber bg-accent text-amber"
                : "border-border text-warm-gray",
            )}
          >
            <Search className="h-4 w-4" aria-hidden="true" />
            Cliente esistente
          </button>
          <button
            type="button"
            onClick={() => setClientMode("new")}
            className={cn(
              "flex items-center justify-center gap-1.5 rounded-[10px] border py-2.5 text-[13px] font-medium transition-colors",
              clientMode === "new"
                ? "border-amber bg-accent text-amber"
                : "border-border text-warm-gray",
            )}
          >
            <UserPlus className="h-4 w-4" aria-hidden="true" />
            Nuovo cliente
          </button>
        </div>

        {clientMode === "existing" ? (
          <div className="mb-3.5">
            <div className="relative">
              <Search
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-warm-gray"
                aria-hidden="true"
              />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Cerca per nome o animale..."
                aria-label="Cerca cliente esistente"
                className={`${inputClass} pl-9`}
              />
            </div>
            <div className="mt-2 flex flex-col gap-1.5">
              {filteredClients.length === 0 && (
                <p className="px-1 py-2 text-[13px] text-warm-gray">
                  Nessun cliente trovato.
                </p>
              )}
              {filteredClients.map((c) => {
                const isSel = selectedClient === c.name
                return (
                  <button
                    key={c.name}
                    type="button"
                    onClick={() => setSelectedClient(c.name)}
                    className={cn(
                      "flex items-center justify-between rounded-[10px] border px-3 py-2.5 text-left transition-colors",
                      isSel
                        ? "border-amber bg-accent"
                        : "border-border hover:border-amber/50",
                    )}
                  >
                    <span>
                      <span className="block text-sm font-medium text-brown">
                        {c.name}
                      </span>
                      <span className="block text-xs text-warm-gray">
                        {c.pet} · {c.breed}
                      </span>
                    </span>
                    {isSel && (
                      <Check className="h-4 w-4 text-amber" aria-hidden="true" />
                    )}
                  </button>
                )
              })}
            </div>
          </div>
        ) : (
          <div className="mb-3.5 grid gap-3">
            <div>
              <label className={labelClass} htmlFor="owner">
                Proprietario
              </label>
              <input
                id="owner"
                type="text"
                placeholder="Nome e cognome"
                className={inputClass}
                value={ownerName}
                onChange={(e) => setOwnerName(e.target.value)}
              />
            </div>
            <div>
              <label className={labelClass} htmlFor="phone">
                Telefono
              </label>
              <input
                id="phone"
                type="tel"
                placeholder="3xx xxx xxxx"
                className={inputClass}
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className={labelClass} htmlFor="pet">
                  Nome animale
                </label>
                <input
                  id="pet"
                  type="text"
                  placeholder="Es. Milo"
                  className={inputClass}
                  value={petName}
                  onChange={(e) => setPetName(e.target.value)}
                />
              </div>
              <div>
                <label className={labelClass} htmlFor="breed">
                  Razza
                </label>
                <input
                  id="breed"
                  type="text"
                  placeholder="Es. Barboncino"
                  className={inputClass}
                  value={breed}
                  onChange={(e) => setBreed(e.target.value)}
                />
              </div>
            </div>
          </div>
        )}

        {/* Data */}
        <div className="mb-3.5">
          <span className={labelClass}>Data</span>
          <div className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none]">
            {slotDays.map((day, i) => {
              const isSel = dayIndex === i
              return (
                <button
                  key={day.label}
                  type="button"
                  onClick={() => {
                    setDayIndex(i)
                    setSelectedTime(null)
                  }}
                  className={cn(
                    "flex-shrink-0 rounded-[10px] border px-3.5 py-2 text-[13px] font-medium transition-colors",
                    isSel
                      ? "border-amber bg-amber text-primary-foreground"
                      : "border-border text-brown",
                  )}
                >
                  {day.label}
                </button>
              )
            })}
          </div>
        </div>

        {/* Orario */}
        <div className="mb-3.5">
          <span className={labelClass}>Orario</span>

          {isDayFull && (
            <div className="mb-2.5 flex items-center gap-2 rounded-[10px] border border-destructive/30 bg-destructive/10 px-3.5 py-2.5 text-[13px] font-semibold text-destructive">
              Giornata completa
            </div>
          )}

          <div className="mt-1.5 grid grid-cols-3 gap-2">
            {allSlots.map((slot) => {
              const occupied = activeDay.occupied.includes(slot)
              const isSel = selectedTime === slot
              return (
                <button
                  key={slot}
                  type="button"
                  disabled={occupied}
                  onClick={() => setSelectedTime(slot)}
                  aria-label={occupied ? `${slot} occupato` : `Seleziona ${slot}`}
                  className={cn(
                    "flex flex-col items-center rounded-[10px] border px-2 py-2 text-[13px] font-medium transition-colors",
                    occupied
                      ? "cursor-not-allowed border-destructive/30 bg-destructive/10 text-destructive"
                      : isSel
                        ? "border-amber bg-amber text-primary-foreground"
                        : "border-border text-brown hover:border-amber/50",
                  )}
                >
                  {slot}
                  {occupied && (
                    <span className="text-[10px] font-semibold uppercase tracking-wide">
                      Occupato
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        </div>

        {/* Servizi */}
        <div className="mb-3.5">
          <span className={labelClass}>Servizi richiesti</span>
          <div className="mt-1.5 grid grid-cols-2 gap-2">
            {services.map((service) => (
              <label
                key={service}
                className="flex cursor-pointer items-center gap-2 rounded-[10px] border border-border px-3 py-2.5 text-[13px] text-brown transition-colors has-[:checked]:border-amber has-[:checked]:bg-accent"
              >
                <input
                  type="checkbox"
                  className="accent-amber"
                  checked={selectedServices.includes(service)}
                  onChange={() => toggleService(service)}
                />
                {service}
              </label>
            ))}
          </div>
        </div>

        {error && (
          <div className="mb-3.5 rounded-[10px] border border-destructive/30 bg-destructive/10 px-3.5 py-2.5 text-[13px] font-semibold text-destructive">
            {error}
          </div>
        )}

        <button
          type="submit"
          className="w-full rounded-xl bg-amber py-3 text-sm font-medium text-primary-foreground transition-colors hover:brightness-95"
        >
          {editing ? "Salva Modifiche" : "Conferma Appuntamento"}
        </button>
      </form>
    </section>
  )
}
