"use client"

import { MessageCircle } from "lucide-react"
import { pet } from "@/lib/booking-data"

type ConfirmStepProps = {
  day: string | null
  time: string | null
  serviceNames: string[]
  total: number
  note: string
  onNoteChange: (value: string) => void
}

export function ConfirmStep({
  day,
  time,
  serviceNames,
  total,
  note,
  onNoteChange,
}: ConfirmStepProps) {
  return (
    <div>
      <div className="mb-3.5 flex items-start gap-2 rounded-xl border border-[#b8dcf0] bg-c-sage-pale px-3.5 py-3 text-[13px] text-c-sage">
        <MessageCircle className="mt-0.5 h-4 w-4 flex-shrink-0" aria-hidden="true" />
        <span>
          Riceverai un reminder via WhatsApp 24h prima dell&apos;appuntamento.
        </span>
      </div>

      <div className="mb-3 rounded-[18px] border border-c-border bg-white p-5">
        <h2 className="mb-3.5 font-display text-[17px] text-c-brown">
          Riepilogo prenotazione
        </h2>
        <RecapRow label="Animale" value={`${pet.name} – ${pet.breed}`} />
        <RecapRow label="Data" value={day ?? "Da definire"} />
        <RecapRow label="Orario" value={time ?? "–"} />
        <RecapRow
          label="Servizi"
          value={serviceNames.length ? serviceNames.join(", ") : "–"}
        />
        <div className="flex justify-between pb-1 pt-3.5 text-base font-semibold text-c-brown">
          <span>Totale</span>
          <span className="text-c-amber">€{total}</span>
        </div>
      </div>

      <div className="mb-3 rounded-[18px] border border-c-border bg-white p-5">
        <h2 className="mb-3.5 font-display text-[17px] text-c-brown">
          Le tue note (facoltativo)
        </h2>
        <textarea
          value={note}
          onChange={(e) => onNoteChange(e.target.value)}
          placeholder="Es. Luna è un po' agitata alle orecchie, meglio andarci piano..."
          rows={3}
          className="w-full resize-none rounded-[10px] border border-c-border bg-white px-3.5 py-2.5 text-sm text-c-brown outline-none transition-colors focus:border-c-amber"
        />
      </div>
    </div>
  )
}

function RecapRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between border-b border-c-border py-2.5 text-sm last:border-b-0">
      <span className="text-c-gray">{label}</span>
      <span className="font-medium text-c-brown">{value}</span>
    </div>
  )
}
