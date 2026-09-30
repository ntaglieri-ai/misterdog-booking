"use client"

import { useActionState } from "react"
import { Lock } from "lucide-react"
import { loginAction } from "@/app/admin/actions"
import { AppHeader } from "@/components/app-header"

export function PinForm({ disabledReason }: { disabledReason?: string }) {
  const [state, formAction, pending] = useActionState(loginAction, null)

  return (
    <div className="min-h-screen bg-background text-foreground">
      <AppHeader />
      <main className="mx-auto flex max-w-[380px] flex-col px-5 py-12">
        <span className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-amber/15 text-sage">
          <Lock className="h-5 w-5" aria-hidden="true" />
        </span>
        <h1 className="font-serif text-2xl text-brown">Ciao Clara</h1>
        <p className="mb-6 text-sm leading-relaxed text-warm-gray">
          Inserisci il PIN per aprire l&apos;agenda del salone.
        </p>

        {disabledReason ? (
          <p className="rounded-xl border border-border bg-card p-4 text-sm leading-relaxed text-brown">
            {disabledReason}
          </p>
        ) : (
          <form action={formAction} className="flex flex-col gap-3">
            <label htmlFor="pin" className="text-xs font-medium uppercase tracking-wide text-warm-gray">
              PIN
            </label>
            <input
              id="pin"
              name="pin"
              type="password"
              inputMode="numeric"
              autoComplete="current-password"
              required
              autoFocus
              className="w-full rounded-xl border border-border bg-card px-4 py-3 text-center text-2xl tracking-[0.5em] text-brown outline-none focus:border-amber"
            />
            {state?.error && (
              <p role="alert" className="text-sm text-destructive">
                {state.error}
              </p>
            )}
            <button
              type="submit"
              disabled={pending}
              className="mt-1 rounded-xl bg-brown py-3 text-sm font-semibold text-cream transition-opacity disabled:opacity-60"
            >
              {pending ? "Verifica…" : "Entra"}
            </button>
          </form>
        )}
      </main>
    </div>
  )
}
