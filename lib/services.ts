// NOTA: le durate dei servizi diversi dal bagno (tosature, tagli extra, pulizia denti)
// sono provvisorie e vanno confermate con il salone.

export type DogSize = "XS" | "S" | "M" | "L" | "XL"

export type ServiceCategoryId =
  | "bagno-corto"
  | "bagno-lungo"
  | "riccio"
  | "liscio"
  | "extra"
  | "gatto"
  | "denti"

export type Pet = "cane" | "gatto"

export type CatalogService = {
  id: string
  name: string
  category: ServiceCategoryId
  size: DogSize | null
  exampleBreed: string
  priceFrom: number
  isFrom: boolean
  durationMin: number
}

export const sizes: { id: DogSize; exampleBreed: string }[] = [
  { id: "XS", exampleBreed: "Chihuahua" },
  { id: "S", exampleBreed: "Jack Russell" },
  { id: "M", exampleBreed: "Bulldog Francese" },
  { id: "L", exampleBreed: "Labrador" },
  { id: "XL", exampleBreed: "Rottweiler" },
]

export const categories: { id: ServiceCategoryId; label: string; note?: string }[] = [
  { id: "bagno-corto", label: "Bagno pelo corto" },
  { id: "bagno-lungo", label: "Bagno pelo lungo" },
  { id: "riccio", label: "Taglio pelo riccio" },
  { id: "liscio", label: "Taglio pelo liscio", note: "Rifiniture a forbice" },
  { id: "extra", label: "Tagli extra" },
  { id: "gatto", label: "Gatto" },
  { id: "denti", label: "Pulizia denti a ultrasuoni" },
]

export const defaultServices: CatalogService[] = [
  { id: "bagno-corto-xs", name: "Bagno pelo corto XS", category: "bagno-corto", size: "XS", exampleBreed: "Chihuahua", priceFrom: 18, isFrom: true, durationMin: 30 },
  { id: "bagno-corto-s", name: "Bagno pelo corto S", category: "bagno-corto", size: "S", exampleBreed: "Jack Russell", priceFrom: 20, isFrom: true, durationMin: 45 },
  { id: "bagno-corto-m", name: "Bagno pelo corto M", category: "bagno-corto", size: "M", exampleBreed: "Bulldog Francese", priceFrom: 25, isFrom: true, durationMin: 60 },
  { id: "bagno-corto-l", name: "Bagno pelo corto L", category: "bagno-corto", size: "L", exampleBreed: "Labrador", priceFrom: 35, isFrom: true, durationMin: 90 },
  { id: "bagno-corto-xl", name: "Bagno pelo corto XL", category: "bagno-corto", size: "XL", exampleBreed: "Rottweiler", priceFrom: 40, isFrom: true, durationMin: 120 },

  { id: "bagno-lungo-xs", name: "Bagno pelo lungo XS", category: "bagno-lungo", size: "XS", exampleBreed: "Yorkshire", priceFrom: 25, isFrom: true, durationMin: 30 },
  { id: "bagno-lungo-s", name: "Bagno pelo lungo S", category: "bagno-lungo", size: "S", exampleBreed: "Spitz", priceFrom: 30, isFrom: true, durationMin: 45 },
  { id: "bagno-lungo-m", name: "Bagno pelo lungo M", category: "bagno-lungo", size: "M", exampleBreed: "Border Collie", priceFrom: 40, isFrom: true, durationMin: 60 },
  { id: "bagno-lungo-l", name: "Bagno pelo lungo L", category: "bagno-lungo", size: "L", exampleBreed: "Golden Retriever", priceFrom: 50, isFrom: true, durationMin: 90 },
  { id: "bagno-lungo-xl", name: "Bagno pelo lungo XL", category: "bagno-lungo", size: "XL", exampleBreed: "Pastore Tedesco", priceFrom: 60, isFrom: true, durationMin: 120 },

  { id: "tosatura-lagotto", name: "Tosatura Lagotto (solo tosatura)", category: "riccio", size: null, exampleBreed: "Lagotto", priceFrom: 25, isFrom: true, durationMin: 60 },
  { id: "tosatura-barbone-toy", name: "Tosatura Barbone Toy (rifiniture a forbice)", category: "riccio", size: null, exampleBreed: "Barbone Toy", priceFrom: 40, isFrom: true, durationMin: 60 },
  { id: "tosatura-barbone-standard", name: "Tosatura Barbone Standard (rifiniture a forbice)", category: "riccio", size: null, exampleBreed: "Barbone Standard", priceFrom: 50, isFrom: true, durationMin: 90 },

  { id: "tosatura-yorkshire", name: "Tosatura Yorkshire", category: "liscio", size: null, exampleBreed: "Yorkshire", priceFrom: 35, isFrom: true, durationMin: 60 },
  { id: "tosatura-shih-tzu", name: "Tosatura Shih Tzu", category: "liscio", size: null, exampleBreed: "Shih Tzu", priceFrom: 35, isFrom: true, durationMin: 60 },
  { id: "tosatura-maltese", name: "Tosatura Maltese", category: "liscio", size: null, exampleBreed: "Maltese", priceFrom: 40, isFrom: true, durationMin: 60 },

  { id: "taglio-volpino-orsetto", name: "Taglio Volpino Orsetto", category: "extra", size: null, exampleBreed: "Volpino", priceFrom: 35, isFrom: true, durationMin: 60 },
  { id: "stripping-jack-russell", name: "Stripping Jack Russell", category: "extra", size: null, exampleBreed: "Jack Russell", priceFrom: 40, isFrom: true, durationMin: 60 },
  { id: "trimming-cocker", name: "Trimming Cocker", category: "extra", size: null, exampleBreed: "Cocker", priceFrom: 45, isFrom: true, durationMin: 60 },

  { id: "gatto-corto", name: "Gatto pelo corto", category: "gatto", size: null, exampleBreed: "", priceFrom: 25, isFrom: false, durationMin: 30 },
  { id: "gatto-lungo", name: "Gatto pelo lungo", category: "gatto", size: null, exampleBreed: "", priceFrom: 35, isFrom: false, durationMin: 45 },

  { id: "denti-base", name: "Pulizia denti base", category: "denti", size: null, exampleBreed: "", priceFrom: 20, isFrom: false, durationMin: 30 },
  { id: "denti-profonda", name: "Pulizia denti profonda", category: "denti", size: null, exampleBreed: "", priceFrom: 40, isFrom: false, durationMin: 30 },
]

export type Catalog = {
  services: CatalogService[]
  getService: (id: string) => CatalogService | undefined
  getBath: (coat: "corto" | "lungo", size: DogSize) => CatalogService
  groomingServices: CatalogService[]
  teethServices: CatalogService[]
  catServices: CatalogService[]
}

export function buildCatalog(list: CatalogService[]): Catalog {
  const byId = new Map(list.map((s) => [s.id, s]))
  return {
    services: list,
    getService: (id) => byId.get(id),
    // I bagni non si possono nascondere dal salone, quindi esistono sempre.
    getBath: (coat, size) => byId.get(`bagno-${coat}-${size.toLowerCase()}`)!,
    groomingServices: list.filter((s) => s.category === "riccio" || s.category === "liscio" || s.category === "extra"),
    teethServices: list.filter((s) => s.category === "denti"),
    catServices: list.filter((s) => s.category === "gatto"),
  }
}

/** Servizi sempre offerti: i bagni non possono essere nascosti. */
export function canHide(service: CatalogService) {
  return service.category !== "bagno-corto" && service.category !== "bagno-lungo"
}

export function isSize(value: unknown): value is DogSize {
  return typeof value === "string" && sizes.some((s) => s.id === value)
}

/** Il gatto non ha taglia né pulizia denti; il cane richiede sempre una taglia. */
export function isValidPetSize(list: CatalogService[], size: unknown): size is DogSize | null {
  if (list.some((s) => s.category === "gatto")) return size === null && list.length === 1
  return isSize(size)
}

export function summarize(list: CatalogService[]) {
  return {
    durationMin: list.reduce((sum, s) => sum + s.durationMin, 0),
    price: list.reduce((sum, s) => sum + s.priceFrom, 0),
    isFrom: list.some((s) => s.isFrom),
  }
}

export function formatPrice(price: number, isFrom: boolean) {
  return isFrom ? `da €${price}` : `€${price}`
}

export function formatDuration(min: number) {
  const h = Math.floor(min / 60)
  const m = min % 60
  if (!h) return `${m} min`
  return m ? `${h} h ${m} min` : `${h} h`
}
