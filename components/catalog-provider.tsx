"use client"

import { createContext, useContext, useMemo } from "react"
import { buildCatalog, type Catalog, type CatalogService } from "@/lib/services"

const CatalogContext = createContext<Catalog | null>(null)

export function CatalogProvider({ services, children }: { services: CatalogService[]; children: React.ReactNode }) {
  const catalog = useMemo(() => buildCatalog(services), [services])
  return <CatalogContext.Provider value={catalog}>{children}</CatalogContext.Provider>
}

export function useCatalog() {
  const catalog = useContext(CatalogContext)
  if (!catalog) throw new Error("useCatalog va usato dentro CatalogProvider")
  return catalog
}
