"use client"

import { useCallback, useMemo, useRef, useState, useTransition } from "react"
import { ArrowLeft, ArrowRight, Loader2 } from "lucide-react"
import { mutate } from "swr"
import { createAppointment } from "@/app/prenota/actions"
import { shop } from "@/lib/booking-data"
import { getService, type CatalogService, type DogSize } from "@/lib/services"
import { BookingHero } from "./booking-hero"
import { CatalogView } from "./catalog-view"
import { StepsIndicator } from "./steps-indicator"
import { SizeStep } from "./size-step"
import { ServiceStep } from "./service-step"
import { TeethStep } from "./teeth-step"
import { SummaryStep } from "./summary-step"
import { DateStep } from "./date-step"
import { DetailsStep, type CustomerDetails } from "./details-step"
import { SuccessView, type ConfirmedAppointment } from "./success-view"

type View = "home" | "catalog" | "booking" | "success"
type Step = 1 | 2 | 3 | 4 | 5 | 6

const emptyDetails: CustomerDetails = { customerName: "", phone: "", dogName: "" }

export function BookingFlow() {
  const [view, setView] = useState<View>("home")
  const [step, setStep] = useState<Step>(1)
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

  const scrollTop = () => window.scrollTo(0, 0)

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

  const startBooking = (preset?: CatalogService) => {
    resetBooking()
    if (preset?.size) {
      setSize(preset.size)
      setPrimaryId(preset.id)
      setStep(2)
    } else {
      if (preset) setPrimaryId(preset.id)
      setStep(1)
    }
    setView("booking")
    scrollTop()
  }

  const goToStep = (next: Step) => {
    setStep(next)
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
      [primaryId, teethId]
        .map((id) => (id ? getService(id) : undefined))
        .filter((s): s is CatalogService => Boolean(s)),
    [primaryId, teethId],
  )
  const serviceIds = selectedServices.map((s) => s.id)

  const canContinue =
    (step === 1 && size !== null) ||
    (step === 2 && primaryId !== null) ||
    step === 3 ||
    step === 4 ||
    (step === 5 && date !== null && start !== null) ||
    step === 6

  const submit = () => {
    if (!size || !date || start === null) return
    setFormError(null)
    startSaving(async () => {
      const result = await createAppointment({ date, start, size, serviceIds, ...details })
      if (result.ok) {
        setConfirmed({
  date,
  start,
  size,
  services: selectedServices,
  ...details,
  cancelToken: result.cancelToken,
})
        mutate((key) => Array.isArray(key) && key[0] === "availability")
        setView("success")
        scrollTop()
        return
      }
      if (result.slotTaken) {
        setStart(null)
        setSlotNotice(result.error)
        mutate(["availability", date, ...serviceIds])
        goToStep(5)
        return
      }
      setFormError(result.error)
    })
  }

  const next = () => {
    if (step === 6) return submit()
    setSlotNotice(null)
    goToStep((step + 1) as Step)
  }

  const back = () => {
    if (step === 1) {
      setView("home")
      scrollTop()
      return
    }
    goToStep((step - 1) as Step)
  }

  return (
    <div className="min-h-screen bg-c-bg text-c-brown">
      {view === "home" && (
        <BookingHero
          onStart={() => startBooking()}
          onCatalog={() => {
            setView("catalog")
            scrollTop()
          }}
        />
      )}

      <main className={view === "home" ? "hidden" : "mx-auto max-w-[480px] px-4 pb-28"}>
        {view === "catalog" && (
          <CatalogView
            onBack={() => {
              setView("home")
              scrollTop()
            }}
            onBookService={startBooking}
          />
        )}

        {view === "booking" && (
          <>
            <StepsIndicator current={step} />
            {step === 1 && <SizeStep selected={size} onSelect={handleSize} />}
            {step === 2 && size && (
              <ServiceStep
                size={size}
                selectedId={primaryId}
                onSelect={(id) => {
                  setPrimaryId(id)
                  setStart(null)
                }}
              />
            )}
            {step === 3 && (
              <TeethStep
                selectedId={teethId}
                onSelect={(id) => {
                  setTeethId(id)
                  setStart(null)
                }}
              />
            )}
            {step === 4 && size && <SummaryStep size={size} services={selectedServices} />}
            {step === 5 && (
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
            {step === 6 && (
              <DetailsStep
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
              setView("home")
              scrollTop()
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
            type={step === 6 ? "submit" : "button"}
            form={step === 6 ? "details-form" : undefined}
            onClick={step === 6 ? undefined : next}
            disabled={!canContinue || isSaving}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-[14px] bg-c-amber py-3.5 text-[15px] font-semibold text-white transition-colors hover:bg-[#2e90c4] disabled:cursor-not-allowed disabled:bg-c-border disabled:text-c-gray"
          >
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                Salvataggio...
              </>
            ) : step === 6 ? (
              "Conferma prenotazione"
            ) : (
              <>
                {step === 3 && !teethId ? "Salta" : "Continua"}
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
