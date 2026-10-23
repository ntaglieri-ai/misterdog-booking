"use client"
import { createContext, useContext, useMemo, useState, type ReactNode } from "react"
import { type CatalogService, type DogSize } from "@/lib/services"

const CatalogContext = createContext<ReturnType<typeof makeCatalog> | null>(null)
function makeCatalog(services: CatalogService[], setServices: (services: CatalogService[]) => void) {
  return {
    services, setServices,
    getService: (id: string) => services.find(s => s.id === id),
    getBath: (coat: "corto" | "lungo", size: DogSize) => services.find(s => s.id === `bagno-${coat}-${size.toLowerCase()}`)!,
    groomingServices: services.filter(s => ["riccio", "liscio", "extra"].includes(s.category)),
    teethServices: services.filter(s => s.category === "denti"),
    catServices: services.filter(s => s.category === "gatto"),
  }
}
export function CatalogProvider({ initialServices, children }: { initialServices: CatalogService[]; children: ReactNode }) {
  const [services, setServices] = useState(initialServices)
  const catalog = useMemo(() => makeCatalog(services, setServices), [services])
  return <CatalogContext.Provider value={catalog}>{children}</CatalogContext.Provider>
}
export function useCatalog() {
  const catalog = useContext(CatalogContext)
  if (!catalog) throw new Error("CatalogProvider mancante")
  return catalog
}
