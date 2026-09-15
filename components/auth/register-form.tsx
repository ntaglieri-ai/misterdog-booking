"use client"

import type { FormEvent } from "react"
import Link from "next/link"
import { InputField, SelectField } from "./form-field"

export function RegisterForm() {
  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    // Registrazione demo: qui andrà la logica di creazione account.
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div className="grid grid-cols-2 gap-3">
        <InputField
          id="nome"
          label="Nome"
          placeholder="Mario"
          autoComplete="given-name"
        />
        <InputField
          id="cognome"
          label="Cognome"
          placeholder="Rossi"
          autoComplete="family-name"
        />
      </div>

      <InputField
        id="indirizzo"
        label="Indirizzo"
        placeholder="Via Roma 12, Avezzano"
        autoComplete="street-address"
      />

      <SelectField
        id="tipoAnimale"
        label="Tipo di animale"
        options={[
          { value: "cane", label: "Cane" },
          { value: "gatto", label: "Gatto" },
          { value: "altro", label: "Altro" },
        ]}
      />

      <InputField
        id="nomeAnimale"
        label="Nome dell'animale"
        placeholder="Luna"
      />

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
        autoComplete="new-password"
      />

      <button
        type="submit"
        className="mt-2 w-full rounded-full bg-c-amber px-6 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-[#2e90c4]"
      >
        Registrati
      </button>

      <p className="mt-5 text-center text-[13px] text-c-gray">
        Hai già un account?{" "}
        <Link
          href="/login"
          className="font-semibold text-c-amber underline-offset-2 hover:underline"
        >
          Accedi
        </Link>
      </p>
    </form>
  )
}
