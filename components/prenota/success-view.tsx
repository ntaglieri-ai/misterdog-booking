import { CheckCircle2, Calendar, Clock, MapPin, Phone } from "lucide-react"
import { pet, shop } from "@/lib/booking-data"

type SuccessViewProps = {
  day: string | null
  time: string | null
  onHome: () => void
}

export function SuccessView({ day, time, onHome }: SuccessViewProps) {
  return (
    <div className="px-5 py-10 text-center">
      <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-c-sage-pale">
        <CheckCircle2 className="h-10 w-10 text-c-sage" aria-hidden="true" />
      </div>
      <h1 className="mb-2 font-display text-2xl text-c-brown">
        Prenotazione confermata!
      </h1>
      <p className="text-sm leading-relaxed text-c-gray">
        {pet.name} è attesa da {shop.name}.
        <br />
        Ti manderemo un reminder su WhatsApp.
      </p>

      <div className="my-5 rounded-2xl border border-c-border bg-white p-4 text-left">
        <ReminderRow icon={Calendar} text={day ?? "–"} bold />
        <ReminderRow icon={Clock} text={time ?? "–"} bold />
        <ReminderRow icon={MapPin} text={shop.address} />
        <ReminderRow icon={Phone} text={shop.phone} last />
      </div>

      <button
        type="button"
        onClick={onHome}
        className="mx-auto block w-full max-w-[300px] rounded-[14px] bg-c-amber py-3.5 text-[15px] font-semibold text-white transition-colors hover:bg-[#2e90c4]"
      >
        Torna alla home
      </button>
    </div>
  )
}

function ReminderRow({
  icon: Icon,
  text,
  bold,
  last,
}: {
  icon: typeof Calendar
  text: string
  bold?: boolean
  last?: boolean
}) {
  return (
    <div
      className={[
        "flex items-center gap-2.5 text-[13px] text-c-brown",
        last ? "" : "mb-2.5",
      ].join(" ")}
    >
      <Icon className="h-4 w-4 flex-shrink-0 text-c-amber" aria-hidden="true" />
      <span className={bold ? "font-semibold" : ""}>{text}</span>
    </div>
  )
}
