import type { Metadata } from "next"
import { AuthShell } from "@/components/auth/auth-shell"
import { RegisterForm } from "@/components/auth/register-form"

export const metadata: Metadata = {
  title: "Registrati · MisterDogDesk",
  description: "Crea il tuo account per prenotare la toelettatura del tuo animale",
}

export default function RegistrazionePage() {
  return (
    <AuthShell
      title={
        <>
          Crea il tuo <span className="text-c-amber-bright">account</span>
        </>
      }
      subtitle="Registrati per prenotare in pochi tocchi"
    >
      <RegisterForm />
    </AuthShell>
  )
}
