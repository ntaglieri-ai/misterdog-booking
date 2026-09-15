import type { Metadata } from "next"
import { AuthShell } from "@/components/auth/auth-shell"
import { LoginForm } from "@/components/auth/login-form"

export const metadata: Metadata = {
  title: "Accedi · MisterDogDesk",
  description: "Accedi al tuo account MisterDogDesk",
}

export default function LoginPage() {
  return (
    <AuthShell
      title={
        <>
          Bentornato su <span className="text-c-amber-bright">MisterDog</span>
        </>
      }
      subtitle="Accedi per gestire le tue prenotazioni"
    >
      <LoginForm />
    </AuthShell>
  )
}
