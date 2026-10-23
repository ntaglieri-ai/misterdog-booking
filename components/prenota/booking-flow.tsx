"use client"

import { useCatalog } from "@/components/catalog-provider"

import { useCallback, useMemo, useRef, useState, useTransition } from "react"
import { ArrowLeft, ArrowRight, Loader2 } from "lucide-react"
import { mutate } from "swr"
import { createAppointment } from "@/app/prenota/actions"
import { type CatalogService, type DogSize, type Pet } from "@/lib/services"
import { BookingHero } from "./booking-hero"
import { CatalogView } from "./catalog-view"
import { AnimalView } from "./animal-view"
import { StepsIndicator } from "./steps-indicator"
import { SizeStep } from "./size-step"
import { CatServiceStep, ServiceStep } from "./service-step"
import { TeethStep } from "./teeth-step"
import { SummaryStep } from "./summary-step"
import { DateStep } from "./date-step"
import { DetailsStep, type CustomerDetails } from "./details-step"
import { SuccessView, type ConfirmedAppointment } from "./success-view"

type View = "home" | "catalog" | "animal" | "booking" | "success"
type StepId = "size" | "service" | "teeth" | "summary" | "date" | "details"

const stepLabels: Record<StepId, string> = {
  size: "Taglia",
  service: "Servizio",
  teeth: "Denti",
  summary: "Riepilogo",
  date: "Data e ora",
  details: "I tuoi dati",
}

const stepsByPet: Record<Pet, StepId[]> = {
  cane: ["size", "service", "teeth", "summary", "date", "details"],
  gatto: ["service", "summary", "date", "details"],
}

const emptyDetails: CustomerDetails = { customerName: "", phone: "", dogName: "" }

export function BookingFlow() {
  const { getService } = useCatalog()
  const [view, setView] = useState<View>("home")
  const [pet, setPet] = useState<Pet>("cane")
  const [stepIndex, setStepIndex] = useState(0)
  const [size, setSize] = useState<DogSize | null>(null)
  const [primaryId, setPrimaryId] = useState<string | null>(null)
  const [teethId, setTeethId] = useState<string | null>(null)
  const [date, setDate] = useState<string | null>(null)
  const [start, setStart] = useState<number | null>(null)
  const [details, setDetails] = useState<CustomerDetails>(emptyDetails)
  const [slotNotice, setSlotNotice] = useState<string | null>(null)
  const [formError, setFormError] = useState<string | null>(null)
  const [confirmed, setConfirmed] = useState<ConfirmedAppointment | null>(null)
  const [isSaving, startSaving] = useTransition()
  const [toast, setToast] = useState({ message: "", show: false })
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const showToast = useCallback((message: string) => {
    setToast({ message, show: true })
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    timeoutRef.current = setTimeout(() => setToast((t) => ({ ...t, show: false })), 2500)
  }, [])

  const steps = stepsByPet[pet]
  const step = steps[stepIndex]
  const isLastStep = step === "details"

  const scrollTop = () => window.scrollTo(0, 0)

  const go = (next: View) => {
    setView(next)
    scrollTop()
  }

  const resetBooking = useCallback(() => {
    setSize(null)
    setPrimaryId(null)
    setTeethId(null)
    setDate(null)
    setStart(null)
    setDetails(emptyDetails)
    setSlotNotice(null)
    setFormError(null)
  }, [])

  const startBooking = (nextPet: Pet, preset?: CatalogService) => {
    resetBooking()
    setPet(nextPet)
    if (preset) setPrimaryId(preset.id)
    if (preset?.size) setSize(preset.size)
    const order = stepsByPet[nextPet]
    setStepIndex(nextPet === "cane" && preset?.size ? order.indexOf("service") : 0)
    go("booking")
  }

  const bookFromCatalog = (service: CatalogService) =>
    startBooking(service.category === "gatto" ? "gatto" : "cane", service)

  const goToStep = (id: StepId) => {
    setStepIndex(steps.indexOf(id))
    scrollTop()
  }

  const handleSize = (next: DogSize) => {
    setSize(next)
    // Il bagno dipende dalla taglia: se cambia, ricalcola lo stesso tipo di pelo.
    const current = primaryId ? getService(primaryId) : undefined
    if (current?.size) {
      const coat = current.category === "bagno-corto" ? "corto" : "lungo"
      setPrimaryId(`bagno-${coat}-${next.toLowerCase()}`)
    }
    setStart(null)
  }

  const selectedServices = useMemo(
    () =>
      [primaryId, pet === "cane" ? teethId : null]
        .map((id) => (id ? getService(id) : undefined))
        .filter((s): s is CatalogService => Boolean(s)),
    [primaryId, teethId, pet, getService],
  )
  const serviceIds = selectedServices.map((s) => s.id)
  const bookingSize = pet === "cane" ? size : null

  const canContinue =
    (step === "size" && size !== null) ||
    (step === "service" && primaryId !== null) ||
    step === "teeth" ||
    step === "summary" ||
    (step === "date" && date !== null && start !== null) ||
    step === "details"

  const submit = () => {
    if ((pet === "cane" && !size) || !date || start === null) return
    setFormError(null)
    startSaving(async () => {
      const result = await createAppointment({ date, start, size: bookingSize, serviceIds, ...details })
      if (result.ok) {
        setConfirmed({
          date,
          start,
          size: bookingSize,
          services: selectedServices,
          ...details,
          cancelToken: result.cancelToken,
        })
        mutate((key) => Array.isArray(key) && key[0] === "availability")
        go("success")
        return
      }
      if (result.slotTaken) {
        setStart(null)
        setSlotNotice(result.error)
        mutate(["availability", date, ...serviceIds])
        goToStep("date")
        return
      }
      setFormError(result.error)
    })
  }

  const next = () => {
    if (isLastStep) return submit()
    setSlotNotice(null)
    setStepIndex((i) => i + 1)
    scrollTop()
  }

  const back = () => {
    if (stepIndex === 0) return go("animal")
    setStepIndex((i) => i - 1)
    scrollTop()
  }

  return (
    <div className="min-h-screen bg-c-bg text-c-brown">
      {view === "home" && <BookingHero onStart={() => go("animal")} onCatalog={() => go("catalog")} />}

      <main className={view === "home" ? "hidden" : "mx-auto max-w-[480px] px-4 pb-28"}>
        {view === "catalog" && <CatalogView onBack={() => go("home")} onBookService={bookFromCatalog} />}

        {view === "animal" && <AnimalView onBack={() => go("home")} onSelect={(p) => startBooking(p)} />}

        {view === "booking" && (
          <>
            <StepsIndicator labels={steps.map((id) => stepLabels[id])} current={stepIndex + 1} />
            {step === "size" && <SizeStep selected={size} onSelect={handleSize} />}
            {step === "service" && pet === "cane" && size && (
              <ServiceStep
                size={size}
                selectedId={primaryId}
                onSelect={(id) => {
                  setPrimaryId(id)
                  setStart(null)
                }}
              />
            )}
            {step === "service" && pet === "gatto" && (
              <CatServiceStep
                selectedId={primaryId}
                onSelect={(id) => {
                  setPrimaryId(id)
                  setStart(null)
                }}
              />
            )}
            {step === "teeth" && (
              <TeethStep
                selectedId={teethId}
                onSelect={(id) => {
                  setTeethId(id)
                  setStart(null)
                }}
              />
            )}
            {step === "summary" && <SummaryStep size={bookingSize} services={selectedServices} />}
            {step === "date" && (
              <DateStep
                serviceIds={serviceIds}
                selectedDate={date}
                selectedStart={start}
                notice={slotNotice}
                onSelectDate={(d) => {
                  setDate(d)
                  setStart(null)
                  setSlotNotice(null)
                }}
                onSelectStart={(s) => {
                  setStart(s)
                  setSlotNotice(null)
                }}
              />
            )}
            {step === "details" && (
              <DetailsStep
                petLabel={pet}
                value={details}
                onChange={setDetails}
                error={formError}
                onSubmit={submit}
              />
            )}
          </>
        )}

        {view === "success" && confirmed && (
          <SuccessView
            appointment={confirmed}
            onHome={() => {
              resetBooking()
              setConfirmed(null)
              go("home")
            }}
          />
        )}
      </main>

      {view === "booking" && (
        <div className="fixed inset-x-0 bottom-0 z-[200] mx-auto flex max-w-[480px] gap-2.5 border-t border-c-border bg-c-bg px-4 pb-6 pt-3">
          <button
            type="button"
            onClick={back}
            aria-label="Indietro"
            className="flex h-[50px] w-[50px] flex-shrink-0 items-center justify-center rounded-[14px] border border-c-border bg-white text-c-brown transition-colors hover:border-c-amber"
          >
            <ArrowLeft className="h-5 w-5" aria-hidden="true" />
          </button>
          <button
            type={isLastStep ? "submit" : "button"}
            form={isLastStep ? "details-form" : undefined}
            onClick={isLastStep ? undefined : next}
            disabled={!canContinue || isSaving}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-[14px] bg-c-amber py-3.5 text-[15px] font-semibold text-white transition-colors hover:bg-[#2e90c4] disabled:cursor-not-allowed disabled:bg-c-border disabled:text-c-gray"
          >
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                Salvataggio...
              </>
            ) : isLastStep ? (
              "Conferma prenotazione"
            ) : (
              <>
                {step === "teeth" && !teethId ? "Salta" : "Continua"}
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </>
            )}
          </button>
        </div>
      )}

      <div
        className={[
          "fixed bottom-[90px] left-1/2 z-[300] -translate-x-1/2 whitespace-nowrap rounded-full bg-c-brown px-5 py-2.5 text-[13px] text-white transition-all duration-300",
          toast.show ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0",
        ].join(" ")}
        role="status"
        aria-live="polite"
      >
        {toast.message}
      </div>
    </div>
  )
}
