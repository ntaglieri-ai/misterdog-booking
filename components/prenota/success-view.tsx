import { Calendar, Cat, CheckCircle2, Clock, Dog, MapPin, Phone } from "lucide-react"
import { shop } from "@/lib/booking-data"
import { formatMinutes } from "@/lib/availability"
import { formatDuration, formatPrice, summarize, type CatalogService, type DogSize } from "@/lib/services"
import { formatLongDate } from "@/lib/shop-time"
import { PRICE_NOTE } from "./summary-step"

export type ConfirmedAppointment = {
  date: string
  start: number
  size: DogSize | null
  services: CatalogService[]
  customerName: string
  phone: string
  dogName: string
  cancelToken: string
}

export function SuccessView({
  appointment,
  onHome,
}: {
  appointment: ConfirmedAppointment
  onHome: () => void
}) {
  const total = summarize(appointment.services)
  const end = appointment.start + total.durationMin
  return (
    <div className="py-8">
      <div className="mb-6 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-c-sage-pale">
          <CheckCircle2 className="h-9 w-9 text-c-sage" aria-hidden="true" />
        </div>
        <h1 className="mb-1 font-display text-2xl text-c-brown text-balance">
          Prenotazione confermata!
        </h1>
        <p className="text-sm leading-relaxed text-c-gray">
          Ti aspettiamo con {appointment.dogName}, {appointment.customerName}.
        </p>
      </div>

      <div className="mb-3 rounded-[18px] border border-c-border bg-white p-5">
        <div className="flex flex-col gap-2.5 border-b border-c-border pb-4 text-sm text-c-brown">
          <Line icon={Calendar} text={formatLongDate(appointment.date)} bold />
          <Line icon={Clock} text={`${formatMinutes(appointment.start)} – ${formatMinutes(end)} (${formatDuration(total.durationMin)})`} bold />
          <Line
            icon={appointment.size ? Dog : Cat}
            text={`${appointment.dogName} · ${appointment.size ? `taglia ${appointment.size}` : "gatto"}`}
          />
          <Line icon={Phone} text={appointment.phone} />
        </div>
        <ul className="border-b border-c-border py-2">
          {appointment.services.map((s) => (
            <li key={s.id} className="flex justify-between gap-3 py-1.5 text-sm text-c-brown">
              <span>{s.name}</span>
              <span className="whitespace-nowrap font-medium">{formatPrice(s.priceFrom, s.isFrom)}</span>
            </li>
          ))}
        </ul>
        <div className="flex items-baseline justify-between pt-3">
          <span className="text-sm font-semibold text-c-brown">Totale</span>
          <span className="font-display text-xl text-c-amber">{formatPrice(total.price, total.isFrom)}</span>
        </div>
      </div>
      <p className="mb-5 text-xs leading-relaxed text-c-gray">{PRICE_NOTE}</p>

      <div className="mb-6 flex flex-col gap-2 text-sm text-c-gray">
        <Line icon={MapPin} text={shop.address} />
        <Line icon={Phone} text={`Per modifiche chiama il ${shop.phone}`} />
      </div>

      <a
        href={`/prenota/appuntamento/${appointment.cancelToken}`}
        className="mb-3 block w-full rounded-[14px] border border-c-border bg-white py-3.5 text-center text-[15px] font-semibold text-c-brown transition-colors hover:bg-c-sage-pale"
      >
        Vedi o annulla l&apos;appuntamento
      </a>

      <button
        type="button"
        onClick={onHome}
        className="w-full rounded-[14px] bg-c-amber py-3.5 text-[15px] font-semibold text-white transition-colors hover:bg-[#2e90c4]"
      >
        Torna alla home
      </button>
    </div>
  )
}

function Line({ icon: Icon, text, bold }: { icon: typeof Calendar; text: string; bold?: boolean }) {
  return (
    <div className="flex items-center gap-2.5">
      <Icon className="h-4 w-4 flex-shrink-0 text-c-amber" aria-hidden="true" />
      <span className={bold ? "font-semibold" : ""}>{text}</span>
    </div>
  )
}
