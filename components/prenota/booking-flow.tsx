"use client"

import { useCallback, useMemo, useRef, useState } from "react"
import { ArrowRight } from "lucide-react"
import { services, shop } from "@/lib/booking-data"
import { BookingHero } from "./booking-hero"
import { HomeView } from "./home-view"
import { StepsIndicator } from "./steps-indicator"
import { DateStep } from "./date-step"
import { ServicesStep } from "./services-step"
import { ConfirmStep } from "./confirm-step"
import { SuccessView } from "./success-view"

type View = "home" | "step1" | "step2" | "step3" | "success"

const defaultServices = services.filter((s) => s.defaultSelected).map((s) => s.id)

export function BookingFlow() {
  const [view, setView] = useState<View>("home")
  const [selectedDay, setSelectedDay] = useState<string | null>(null)
  const [selectedTime, setSelectedTime] = useState<string | null>(null)
  const [selectedServices, setSelectedServices] = useState<string[]>(defaultServices)
  const [note, setNote] = useState("")
  const [toast, setToast] = useState({ message: "", show: false })
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const showToast = useCallback((message: string) => {
    setToast({ message, show: true })
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    timeoutRef.current = setTimeout(() => {
      setToast((t) => ({ ...t, show: false }))
    }, 2500)
  }, [])

  const goTo = useCallback((next: View) => {
    setView(next)
    if (typeof window !== "undefined") window.scrollTo(0, 0)
  }, [])

  const toggleService = useCallback((id: string) => {
    setSelectedServices((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id],
    )
  }, [])

  const selectedServiceObjects = useMemo(
    () => services.filter((s) => selectedServices.includes(s.id)),
    [selectedServices],
  )
  const total = useMemo(
    () => selectedServiceObjects.reduce((sum, s) => sum + s.price, 0),
    [selectedServiceObjects],
  )
  const serviceNames = selectedServiceObjects.map((s) => s.name)

  const showHero = view === "home"
  const showBottomBar = view === "step1" || view === "step2" || view === "step3"

  return (
    <div className="min-h-screen bg-c-bg text-c-brown">
      {showHero && <BookingHero onStart={() => goTo("step1")} />}

      <div className="mx-auto max-w-[480px] px-4 pb-24">
        {view === "home" && (
          <HomeView
            onBook={() => goTo("step1")}
            onCall={() => showToast(`Chiama ${shop.phone}`)}
          />
        )}

        {view === "step1" && (
          <>
            <StepsIndicator current={1} />
            <DateStep
              selectedDay={selectedDay}
              selectedTime={selectedTime}
              onSelectDay={setSelectedDay}
              onSelectTime={setSelectedTime}
            />
          </>
        )}

        {view === "step2" && (
          <>
            <StepsIndicator current={2} />
            <ServicesStep selected={selectedServices} onToggle={toggleService} />
          </>
        )}

        {view === "step3" && (
          <>
            <StepsIndicator current={3} />
            <ConfirmStep
              day={selectedDay}
              time={selectedTime}
              serviceNames={serviceNames}
              total={total}
              note={note}
              onNoteChange={setNote}
            />
          </>
        )}

        {view === "success" && (
          <SuccessView
            day={selectedDay}
            time={selectedTime}
            onHome={() => goTo("home")}
          />
        )}
      </div>

      {showBottomBar && (
        <div className="fixed inset-x-0 bottom-0 z-[200] mx-auto max-w-[480px] border-t border-c-border bg-c-bg px-5 pb-6 pt-3">
          {view === "step1" && (
            <PrimaryButton
              disabled={!selectedDay || !selectedTime}
              onClick={() => goTo("step2")}
            >
              Continua <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </PrimaryButton>
          )}
          {view === "step2" && (
            <PrimaryButton onClick={() => goTo("step3")}>
              Continua <ArrowRight className="h-4 w-4" aria-hidden="true" />
              {total > 0 && <span className="ml-0.5">· €{total}</span>}
            </PrimaryButton>
          )}
          {view === "step3" && (
            <PrimaryButton onClick={() => goTo("success")}>
              Conferma prenotazione
            </PrimaryButton>
          )}
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

function PrimaryButton({
  children,
  disabled,
  onClick,
}: {
  children: React.ReactNode
  disabled?: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className="flex w-full items-center justify-center gap-1.5 rounded-[14px] bg-c-amber py-3.5 text-[15px] font-semibold text-white transition-colors hover:bg-[#2e90c4] disabled:cursor-not-allowed disabled:bg-c-border disabled:text-c-gray"
    >
      {children}
    </button>
  )
}
