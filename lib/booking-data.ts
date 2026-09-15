import { Bath, Scissors, Sparkles, Ear, Smile, type LucideIcon } from "lucide-react"

export type Service = {
  id: string
  name: string
  description: string
  price: number
  icon: LucideIcon
  defaultSelected?: boolean
}

export const services: Service[] = [
  {
    id: "bagno",
    name: "Bagno professionale",
    description: "Shampoo, balsamo, asciugatura",
    price: 18,
    icon: Bath,
    defaultSelected: true,
  },
  {
    id: "taglio",
    name: "Taglio e styling",
    description: "Taglio personalizzato",
    price: 22,
    icon: Scissors,
    defaultSelected: true,
  },
  {
    id: "nail",
    name: "Nail trim",
    description: "Taglio unghie",
    price: 8,
    icon: Sparkles,
  },
  {
    id: "orecchie",
    name: "Pulizia orecchie",
    description: "Ispezione e pulizia",
    price: 6,
    icon: Ear,
  },
  {
    id: "denti",
    name: "Igiene dentale",
    description: "Pulizia denti",
    price: 10,
    icon: Smile,
  },
]

export const pet = {
  name: "Luna",
  breed: "Bichon Frisé",
  detail: "Bichon Frisé · Femmina · 4 anni",
}

export const shop = {
  name: "MisterDog",
  city: "Avezzano",
  address: "Via Roma 12, Avezzano",
  phone: "347 123 4567",
}

export const history = [
  { icon: Scissors, title: "Toelettatura completa", date: "15 maggio 2025 · €45" },
  { icon: Bath, title: "Bagno + Taglio", date: "3 marzo 2025 · €38" },
  { icon: Scissors, title: "Toelettatura completa", date: "10 gennaio 2025 · €45" },
]

export const allTimes = [
  "9:00",
  "9:30",
  "10:00",
  "10:30",
  "11:00",
  "11:30",
  "14:00",
  "14:30",
  "15:00",
  "15:30",
  "16:00",
  "16:30",
]

export const busyTimes = ["9:30", "11:00", "14:30"]

export const dayNames = ["Dom", "Lun", "Mar", "Mer", "Gio", "Ven", "Sab"]
export const monthNames = [
  "gen",
  "feb",
  "mar",
  "apr",
  "mag",
  "giu",
  "lug",
  "ago",
  "set",
  "ott",
  "nov",
  "dic",
]

export type BookingDay = {
  name: string
  num: number
  disabled: boolean
  full: boolean
  label: string
}

export function buildDays(count = 10): BookingDay[] {
  const today = new Date()
  const days: BookingDay[] = []
  for (let i = 0; i < count; i++) {
    const d = new Date(today)
    d.setDate(today.getDate() + i)
    const isSunday = d.getDay() === 0
    // Alcuni giorni sono al completo (non selezionabili, ma cliccabili per contatto)
    const isFull = !isSunday && (i === 2 || i === 5)
    days.push({
      name: dayNames[d.getDay()],
      num: d.getDate(),
      disabled: isSunday,
      full: isFull,
      label: `${dayNames[d.getDay()]} ${d.getDate()} ${monthNames[d.getMonth()]}`,
    })
  }
  return days
}

export const contact = {
  phone: "347 123 4567",
  phoneHref: "tel:+393471234567",
  whatsappHref:
    "https://wa.me/393471234567?text=" +
    encodeURIComponent(
      "Ciao MisterDog! Vorrei prenotare un appuntamento, mi puoi dire quando siete disponibili?",
    ),
}
