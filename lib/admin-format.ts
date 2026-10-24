import { dayOfWeek, formatMinutes, toMinutes } from "./availability"
import { SLOT_MINUTES, openingHours } from "./config"
import { addDays } from "./shop-time"

/** Numero per wa.me: solo cifre, con prefisso 39 se manca. */
export function toWhatsAppNumber(phone: string) {
  let digits = phone.replace(/[^\d]/g, "")
  if (digits.startsWith("00")) digits = digits.slice(2)
  const hasItalianPrefix = digits.startsWith("39") && digits.length >= 11
  const hasOtherPrefix = phone.trim().startsWith("+") || phone.trim().startsWith("00")
  return hasItalianPrefix || hasOtherPrefix ? digits : `39${digits}`
}

export function closureMessage(input: {
  customerName: string
  dogName: string
  time: string
  bookingUrl: string
}) {
  const firstName = input.customerName.split(" ")[0] || input.customerName
  return `Ciao ${firstName}, purtroppo oggi il salone MisterDog resta chiuso per un imprevisto e il tuo appuntamento per ${input.dogName} delle ${input.time} è annullato. Ci scusiamo! Puoi riprenotare qui: ${input.bookingUrl}`
}

export function whatsAppLink(phone: string, message: string) {
  return `https://wa.me/${toWhatsAppNumber(phone)}?text=${encodeURIComponent(message)}`
}

/** Inizi delle fasce da mezz'ora negli orari di apertura del giorno. */
export function daySlots(date: string) {
  return openingHours[dayOfWeek(date)].flatMap((range) => {
    const slots: number[] = []
    for (let m = toMinutes(range.open); m + SLOT_MINUTES <= toMinutes(range.close); m += SLOT_MINUTES) {
      slots.push(m)
    }
    return slots
  })
}

/** Lunedì della settimana che contiene la data. */
export function weekStart(date: string) {
  const dow = dayOfWeek(date)
  return addDays(date, dow === 0 ? -6 : 1 - dow)
}

const shortDay = new Intl.DateTimeFormat("it-IT", {
  weekday: "short",
  day: "numeric",
  month: "short",
  timeZone: "UTC",
})

export function formatShortDate(date: string) {
  const [y, m, d] = date.split("-").map(Number)
  return shortDay.format(new Date(Date.UTC(y, m - 1, d)))
}

export { formatMinutes }

/** Primo giorno del mese che contiene la data, spostato di `delta` mesi. */
export function monthStart(date: string, delta = 0) {
  const [y, m] = date.split("-").map(Number)
  const d = new Date(Date.UTC(y, m - 1 + delta, 1))
  return d.toISOString().slice(0, 10)
}

const monthLabel = new Intl.DateTimeFormat("it-IT", { month: "long", year: "numeric", timeZone: "UTC" })

export function formatMonth(date: string) {
  const [y, m] = date.split("-").map(Number)
  return monthLabel.format(new Date(Date.UTC(y, m - 1, 1)))
}
