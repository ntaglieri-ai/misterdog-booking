import type { Metadata } from "next"
import Link from "next/link"
import { Calendar, Clock, Dog, Phone } from "lucide-react"
import { getAppointmentByToken } from "@/lib/appointments"
import { formatMinutes } from "@/lib/availability"
import { shop } from "@/lib/booking-data"
import { formatDuration } from "@/lib/services"
import { formatLongDate, shopNow, utcToShopMinutes } from "@/lib/shop-time"
import { CancelButton } from "@/components/prenota/cancel-button"

export const metadata: Metadata = {
  title: "Il tuo appuntamento · Mister Dog",
  robots: { index: false, follow: false },
}

function shopDate(iso: string) {
  return shopNow(new Date(iso)).date
}

export default async function AppointmentPage({
  params,
}: {
  params: Promise<{ token: string }>
}) {
  const { token } = await params
  const appointment = await getAppointmentByToken(token)

  return (
    <main className="mx-auto min-h-dvh max-w-md bg-c-cream px-5 py-10">
      {!appointment ? (
        <div className="text-center">
          <h1 className="mb-2 font-display text-2xl text-c-brown">Appuntamento non trovato</h1>
          <p className="mb-6 text-sm leading-relaxed text-c-gray">
            Il link non è valido. Per informazioni chiama il {shop.phone}.
          </p>
          <BackLink />
        </div>
      ) : (
        <AppointmentDetails token={token} appointment={appointment} />
      )}
    </main>
  )
}

function AppointmentDetails({
  token,
  appointment,
}: {
  token: string
  appointment: NonNullable<Awaited<ReturnType<typeof getAppointmentByToken>>>
}) {
  const date = shopDate(appointment.start_at)
  const start = utcToShopMinutes(new Date(appointment.start_at), date)
  const end = start + appointment.duration_min
  const cancelled = appointment.status === "cancellato"
  const isPast = new Date(appointment.start_at) <= new Date()

  return (
    <>
      <h1 className="mb-1 font-display text-2xl text-c-brown text-balance">
        {cancelled ? "Appuntamento annullato" : "Il tuo appuntamento"}
      </h1>
      <p className="mb-6 text-sm leading-relaxed text-c-gray">
        {cancelled
          ? "Questo appuntamento è stato annullato."
          : `Ciao ${appointment.customer_name}, ecco i dettagli.`}
      </p>

      <div className="mb-6 rounded-[18px] border border-c-border bg-white p-5">
        <div className="flex flex-col gap-2.5 border-b border-c-border pb-4 text-sm text-c-brown">
          <Line icon={Calendar} text={formatLongDate(date)} bold />
          <Line
            icon={Clock}
            text={`${formatMinutes(start)} – ${formatMinutes(end)} (${formatDuration(appointment.duration_min)})`}
            bold
          />
          <Line icon={Dog} text={appointment.size ? `${appointment.dog_name} · taglia ${appointment.size}` : appointment.dog_name} />
        </div>
        <ul className="pt-2">
          {appointment.services.map((s) => (
            <li key={s.id} className="py-1.5 text-sm text-c-brown">
              {s.name}
            </li>
          ))}
        </ul>
      </div>

      {!cancelled && !isPast && <CancelButton token={token} />}

      <div className="mt-6 flex flex-col items-center gap-3 text-sm text-c-gray">
        <Line icon={Phone} text={`Per modifiche chiama il ${shop.phone}`} />
        <BackLink />
      </div>
    </>
  )
}

function BackLink() {
  return (
    <Link href="/prenota" className="text-sm font-semibold text-c-amber underline-offset-4 hover:underline">
      Torna a Mister Dog
    </Link>
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
