import { Calendar, Phone, Dog, PawPrint } from "lucide-react"
import { pet, history } from "@/lib/booking-data"

type HomeViewProps = {
  onBook: () => void
  onCall: () => void
}

export function HomeView({ onBook, onCall }: HomeViewProps) {
  return (
    <div>
      {/* Prossimo appuntamento */}
      <div className="relative mb-3 overflow-hidden rounded-[18px] bg-gradient-to-br from-c-amber to-[#2e90c4] p-[18px] text-white">
        <PawPrint
          className="absolute -bottom-1 right-4 h-12 w-12 opacity-20"
          aria-hidden="true"
        />
        <div className="mb-1.5 text-[11px] uppercase tracking-wide opacity-80">
          Prossimo appuntamento
        </div>
        <div className="mb-1 font-display text-xl">Sabato 7 giugno · 9:00</div>
        <div className="text-[13px] opacity-85">
          {pet.name} · Toelettatura completa
        </div>
      </div>

      {/* Quick nav */}
      <div className="flex gap-2.5 pb-2 pt-4">
        <button
          type="button"
          onClick={onBook}
          className="flex-1 rounded-[14px] border border-c-border bg-white p-3.5 text-center transition-colors hover:border-c-amber"
        >
          <Calendar className="mx-auto mb-1 h-5 w-5 text-c-brown" aria-hidden="true" />
          <div className="text-xs font-medium text-c-brown">Prenota</div>
        </button>
        <button
          type="button"
          onClick={onCall}
          className="flex-1 rounded-[14px] border border-c-border bg-white p-3.5 text-center transition-colors hover:border-c-amber"
        >
          <Phone className="mx-auto mb-1 h-5 w-5 text-c-brown" aria-hidden="true" />
          <div className="text-xs font-medium text-c-brown">Chiama</div>
        </button>
      </div>

      {/* Il tuo animale */}
      <div className="mb-2.5 mt-4 text-[11px] font-semibold uppercase tracking-wider text-c-gray">
        Il tuo animale
      </div>
      <div className="mb-4 flex items-center gap-3.5 rounded-[14px] border border-[#b8dcf0] bg-c-amber-pale p-3.5">
        <div className="flex h-[52px] w-[52px] flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-c-amber-bright to-c-amber">
          <Dog className="h-6 w-6 text-white" aria-hidden="true" />
        </div>
        <div>
          <div className="text-base font-semibold text-c-brown">{pet.name}</div>
          <div className="mt-0.5 text-xs text-c-gray">{pet.detail}</div>
        </div>
      </div>

      {/* Storico visite */}
      <div className="mb-2.5 mt-4 text-[11px] font-semibold uppercase tracking-wider text-c-gray">
        Storico visite
      </div>
      <div className="rounded-[18px] border border-c-border bg-white px-4">
        {history.map((entry, i) => {
          const Icon = entry.icon
          return (
            <div
              key={i}
              className="flex items-center gap-3 border-b border-c-border py-3.5 last:border-b-0"
            >
              <div className="flex h-[38px] w-[38px] flex-shrink-0 items-center justify-center rounded-[10px] bg-c-amber-pale">
                <Icon className="h-[18px] w-[18px] text-c-amber" aria-hidden="true" />
              </div>
              <div>
                <div className="text-[13px] font-medium text-c-brown">
                  {entry.title}
                </div>
                <div className="mt-0.5 text-[11px] text-c-gray">{entry.date}</div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
