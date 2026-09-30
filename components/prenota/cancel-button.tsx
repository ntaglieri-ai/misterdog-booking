"use client"

import { useState, useTransition } from "react"
import { Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { cancelAppointment } from "@/app/prenota/actions"

export function CancelButton({ token }: { token: string }) {
  const router = useRouter()
  const [confirming, setConfirming] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  const cancel = () =>
    startTransition(async () => {
      setError(null)
      const result = await cancelAppointment(token)
      if (!result.ok) {
        setError(result.error)
        return
      }
      router.refresh()
    })

  if (!confirming) {
    return (
      <button
        type="button"
        onClick={() => setConfirming(true)}
        className="w-full rounded-[14px] border border-c-border bg-white py-3.5 text-[15px] font-semibold text-c-brown transition-colors hover:bg-c-sage-pale"
      >
        Annulla appuntamento
      </button>
    )
  }

  return (
    <div className="flex flex-col gap-3 rounded-[18px] border border-c-border bg-white p-4">
      <p className="text-sm leading-relaxed text-c-brown">Vuoi davvero annullare questo appuntamento?</p>
      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setConfirming(false)}
          disabled={pending}
          className="flex-1 rounded-[12px] border border-c-border py-3 text-sm font-semibold text-c-brown"
        >
          No, tienilo
        </button>
        <button
          type="button"
          onClick={cancel}
          disabled={pending}
          className="flex flex-1 items-center justify-center gap-2 rounded-[12px] bg-destructive py-3 text-sm font-semibold text-white"
        >
          {pending && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
          Sì, annulla
        </button>
      </div>
    </div>
  )
}
