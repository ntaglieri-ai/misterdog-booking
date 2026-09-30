import {
  MAX_DOGS_PER_SLOT,
  SLOT_MINUTES,
  closedDates,
  openingHours,
  type OpeningRange,
} from "./config"

/** Orari espressi in minuti dalla mezzanotte, ora locale del salone. */
export type BookedInterval = { start: number; end: number; status?: string }

export type AvailabilityInput = {
  date: string
  durationMin: number
  appointments: BookedInterval[]
  /** Minuto del giorno prima del quale non si può prenotare (es. adesso, se è oggi). */
  notBefore?: number
  hours?: OpeningRange[][]
  closed?: string[]
  capacity?: number
  slot?: number
}

export function toMinutes(hhmm: string) {
  const [h, m] = hhmm.split(":").map(Number)
  return h * 60 + m
}

export function formatMinutes(min: number) {
  const h = Math.floor(min / 60)
  const m = min % 60
  return `${h}:${String(m).padStart(2, "0")}`
}

export function dayOfWeek(date: string) {
  const [y, m, d] = date.split("-").map(Number)
  return new Date(Date.UTC(y, m - 1, d)).getUTCDay()
}

export function isClosedDay(
  date: string,
  hours: OpeningRange[][] = openingHours,
  closed: string[] = closedDates,
) {
  return closed.includes(date) || hours[dayOfWeek(date)].length === 0
}

/** Indici dei blocchi da `slot` minuti coperti dall'intervallo [start, end). */
function blocksOf(start: number, end: number, slot: number) {
  const blocks: number[] = []
  for (let b = Math.floor(start / slot); b * slot < end; b++) blocks.push(b)
  return blocks
}

/** Restituisce gli orari di inizio disponibili (minuti dalla mezzanotte). */
export function getAvailableStarts({
  date,
  durationMin,
  appointments,
  notBefore = 0,
  hours = openingHours,
  closed = closedDates,
  capacity = MAX_DOGS_PER_SLOT,
  slot = SLOT_MINUTES,
}: AvailabilityInput): number[] {
  if (durationMin <= 0 || isClosedDay(date, hours, closed)) return []

  const occupancy = new Map<number, number>()
  for (const appt of appointments) {
    if (appt.status === "cancellato") continue
    for (const b of blocksOf(appt.start, appt.end, slot)) {
      occupancy.set(b, (occupancy.get(b) ?? 0) + 1)
    }
  }

  const starts: number[] = []
  for (const range of hours[dayOfWeek(date)]) {
    const open = toMinutes(range.open)
    const close = toMinutes(range.close)
    const firstStart = Math.ceil(open / slot) * slot
    for (let start = firstStart; start + durationMin <= close; start += slot) {
      if (start < notBefore) continue
      const free = blocksOf(start, start + durationMin, slot).every(
        (b) => (occupancy.get(b) ?? 0) < capacity,
      )
      if (free) starts.push(start)
    }
  }
  return starts
}

export function isStartAvailable(input: AvailabilityInput, start: number) {
  return getAvailableStarts(input).includes(start)
}
