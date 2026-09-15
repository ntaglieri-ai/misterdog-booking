export type Appointment = {
  id: string
  time: string
  name: string
  service: string
  owner: string
  phone: string
  accent: "amber" | "sage"
}

export type DayPart = {
  label: string
  appointments: Appointment[]
}

export const agenda: DayPart[] = [
  {
    label: "Mattina",
    appointments: [
      {
        id: "a1",
        time: "9:00",
        name: "Luna – Bichon Frisé",
        service: "Bagno + Toelettatura completa",
        owner: "Chiara Rossi",
        phone: "347 123 4567",
        accent: "amber",
      },
      {
        id: "a2",
        time: "10:30",
        name: "Briciola – Barboncino",
        service: "Taglio estivo + Nail trim",
        owner: "Marco Bianchi",
        phone: "328 987 6543",
        accent: "sage",
      },
      {
        id: "a3",
        time: "12:00",
        name: "Rocky – Labrador",
        service: "Bagno anti-pelo + Asciugatura",
        owner: "Sara Conti",
        phone: "333 456 7890",
        accent: "amber",
      },
    ],
  },
  {
    label: "Pomeriggio",
    appointments: [
      {
        id: "a4",
        time: "15:00",
        name: "Fuffi – Shih Tzu",
        service: "Toelettatura completa",
        owner: "Anna De Luca",
        phone: "320 111 2222",
        accent: "sage",
      },
      {
        id: "a5",
        time: "16:30",
        name: "Cleo – Golden Retriever",
        service: "Bagno + Spazzolatura professionale",
        owner: "Luca Ferrari",
        phone: "340 999 8888",
        accent: "amber",
      },
    ],
  },
]

export type Client = {
  name: string
  pet: string
  breed: string
  status: { label: string; tone: "green" | "amber" }
  phone: string
  lastVisit: string
  tags: string[]
}

export const clients: Client[] = [
  {
    name: "Chiara Rossi",
    pet: "Luna",
    breed: "Bichon Frisé",
    status: { label: "Cliente fissa", tone: "green" },
    phone: "347 123 4567",
    lastVisit: "15 mag",
    tags: ["8 visite totali", "€320 spesi", "Vaccinazioni ok"],
  },
  {
    name: "Marco Bianchi",
    pet: "Briciola",
    breed: "Barboncino",
    status: { label: "Da richiamare", tone: "amber" },
    phone: "328 987 6543",
    lastVisit: "2 apr",
    tags: ["4 visite totali", "€148 spesi", "Vaccinazione scaduta"],
  },
  {
    name: "Sara Conti",
    pet: "Rocky",
    breed: "Labrador",
    status: { label: "Cliente fissa", tone: "green" },
    phone: "333 456 7890",
    lastVisit: "20 mag",
    tags: ["12 visite totali", "€510 spesi", "Vaccinazioni ok"],
  },
]

export const services = [
  "Bagno",
  "Taglio",
  "Nail trim",
  "Spazzolatura",
  "Orecchie",
  "Denti",
]

// Tutti gli slot orari prenotabili in una giornata
export const allSlots = [
  "9:00",
  "9:30",
  "10:00",
  "10:30",
  "11:00",
  "11:30",
  "12:00",
  "15:00",
  "15:30",
  "16:00",
  "16:30",
  "17:00",
  "17:30",
  "18:00",
]

export type SlotDay = {
  label: string
  occupied: string[]
}

// Giorni prenotabili con i relativi slot già occupati.
// L'ultimo giorno ha tutti gli slot occupati (giornata completa).
export const slotDays: SlotDay[] = [
  { label: "Lun 9 giu", occupied: ["9:00", "10:30", "12:00", "15:00", "16:30"] },
  { label: "Mar 10 giu", occupied: ["9:30", "11:00", "15:30"] },
  { label: "Mer 11 giu", occupied: ["10:00", "16:00", "17:30"] },
  { label: "Gio 12 giu", occupied: [...allSlots] },
]
