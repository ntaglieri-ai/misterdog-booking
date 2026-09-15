"use client"

import type { FormEvent } from "react"
import Link from "next/link"
import { InputField } from "./form-field"

export function LoginForm() {
  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    // Login demo: qui andrà la logica di autenticazione.
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <InputField
        id="email"
        label="Email"
        type="email"
        placeholder="mario.rossi@email.it"
        autoComplete="email"
      />

      <InputField
        id="password"
        label="Password"
        type="password"
        placeholder="••••••••"
        autoComplete="current-password"
      />

      <button
        type="submit"
        className="mt-2 w-full rounded-full bg-c-amber px-6 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-[#2e90c4]"
      >
        Accedi
      </button>

      <p className="mt-5 text-center text-[13px] text-c-gray">
        Non hai un account?{" "}
        <Link
          href="/registrazione"
          className="font-semibold text-c-amber underline-offset-2 hover:underline"
        >
          Registrati
        </Link>
      </p>
    </form>
  )
}
