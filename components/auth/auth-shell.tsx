import type { ReactNode } from "react"
import Image from "next/image"
import { MapPin } from "lucide-react"
import { shop } from "@/lib/booking-data"

type AuthShellProps = {
  title: ReactNode
  subtitle: string
  children: ReactNode
}

export function AuthShell({ title, subtitle, children }: AuthShellProps) {
  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col bg-c-bg">
      <div className="relative overflow-hidden bg-[#87CEEB] px-5 pb-9 pt-9 text-center">
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse at 70% 40%, rgba(135,206,235,0.35), transparent 60%)",
          }}
          aria-hidden="true"
        />
        <div className="relative">
          <span className="mx-auto mb-4 flex h-20 w-20 items-center justify-center overflow-hidden rounded-full bg-white shadow-md ring-2 ring-white/70">
            <Image
              src="/images/misterdog-logo.jpeg"
              alt="Mister Dog Pet Salon"
              width={80}
              height={80}
              className="h-full w-full object-cover"
              priority
            />
          </span>
          <div className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-[#1A2E5A]/15 bg-white/60 px-3.5 py-1.5 text-xs font-medium text-[#1A2E5A]">
            <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
            {shop.name} · {shop.city}
          </div>
          <h1 className="mb-2 font-display text-[26px] leading-tight text-[#1A2E5A] text-balance">
            {title}
          </h1>
          <p className="text-sm text-[#1A2E5A]/70 text-pretty">{subtitle}</p>
        </div>
      </div>

      <div className="flex-1 px-5 py-6">{children}</div>
    </main>
  )
}
