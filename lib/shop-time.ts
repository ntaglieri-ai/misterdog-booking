import { TIMEZONE } from "./config"

const partsFormatter = new Intl.DateTimeFormat("en-US", {
  timeZone: TIMEZONE,
  hourCycle: "h23",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
})

function shopParts(date: Date) {
  const p = Object.fromEntries(
    partsFormatter.formatToParts(date).map((x) => [x.type, x.value]),
  )
  return {
    date: `${p.year}-${p.month}-${p.day}`,
    minutes: Number(p.hour) * 60 + Number(p.minute),
    asUtcMs: Date.UTC(+p.year, +p.month - 1, +p.day, +p.hour, +p.minute, +p.second),
  }
}

/** Data (YYYY-MM-DD) e minuto del giorno correnti nel fuso del salone. */
export function shopNow(now = new Date()) {
  const { date, minutes } = shopParts(now)
  return { date, minutes }
}

/** Converte data + minuti (ora del salone) in un istante UTC. */
export function shopTimeToUtc(date: string, minutes: number): Date {
  const [y, m, d] = date.split("-").map(Number)
  const guess = Date.UTC(y, m - 1, d, 0, minutes)
  const offset = shopParts(new Date(guess)).asUtcMs - guess
  const result = guess - offset
  const offset2 = shopParts(new Date(result)).asUtcMs - result
  return new Date(guess - offset2)
}

/** Minuti dalla mezzanotte (ora del salone) di un istante, relativi alla data indicata. */
export function utcToShopMinutes(instant: Date, date: string) {
  const parts = shopParts(instant)
  if (parts.date === date) return parts.minutes
  return parts.date < date ? 0 : 24 * 60
}

export function addDays(date: string, days: number) {
  const [y, m, d] = date.split("-").map(Number)
  const next = new Date(Date.UTC(y, m - 1, d + days))
  return next.toISOString().slice(0, 10)
}

/** Formato datetime usato da PocketBase nei filtri: "YYYY-MM-DD HH:MM:SS.sssZ". */
export function toPbDate(date: Date) {
  return date.toISOString().replace("T", " ")
}

export function fromPbDate(value: string) {
  return new Date(value.replace(" ", "T"))
}

const longDate = new Intl.DateTimeFormat("it-IT", {
  weekday: "long",
  day: "numeric",
  month: "long",
  timeZone: "UTC",
})

export function formatLongDate(date: string) {
  const [y, m, d] = date.split("-").map(Number)
  const label = longDate.format(new Date(Date.UTC(y, m - 1, d)))
  return label.charAt(0).toUpperCase() + label.slice(1)
}
