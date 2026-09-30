// Orari placeholder: da confermare con il salone.

export type OpeningRange = { open: string; close: string }

export const TIMEZONE = "Europe/Rome"
export const SLOT_MINUTES = 30
export const MAX_DOGS_PER_SLOT = 4
export const BOOKING_DAYS_AHEAD = 30

const standardDay: OpeningRange[] = [
  { open: "09:00", close: "13:00" },
  { open: "15:00", close: "19:00" },
]

// Indice = giorno della settimana (0 = domenica). Array vuoto = chiuso.
export const openingHours: OpeningRange[][] = [
  [],
  standardDay,
  standardDay,
  standardDay,
  standardDay,
  standardDay,
  standardDay,
]

// Chiusure straordinarie in formato YYYY-MM-DD (festivi, ferie...).
export const closedDates: string[] = []
