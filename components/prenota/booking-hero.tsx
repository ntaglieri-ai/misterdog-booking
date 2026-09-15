import Image from "next/image"
import { MapPin } from "lucide-react"
import { shop } from "@/lib/booking-data"

export function BookingHero({ onStart }: { onStart: () => void }) {
  return (
    <div className="relative overflow-hidden bg-gradient-to-b from-[#87CEEB] to-[#e8f4fb] px-5 pb-8 pt-7 text-center">
      {/* Bolle decorative leggere */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(circle at 15% 20%, rgba(255,255,255,0.5), transparent 22%), radial-gradient(circle at 85% 15%, rgba(255,255,255,0.4), transparent 18%)",
        }}
        aria-hidden="true"
      />

      <div className="relative">
        {/* Banner brand con cane cartoon */}
        <div className="relative mx-auto mb-5 w-full max-w-[380px] overflow-hidden rounded-2xl shadow-md ring-1 ring-white/60">
          <Image
            src="/images/misterdog-hero.jpeg"
            alt="Mister Dog Pet Salon"
            width={1200}
            height={800}
            className="h-auto w-full object-cover"
            priority
          />
        </div>

        <div className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-[#1A2E5A]/15 bg-white/70 px-3.5 py-1.5 text-xs font-medium text-[#1A2E5A]">
          <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
          {shop.name} · {shop.city}
        </div>

        <h1 className="mb-2 font-display text-[27px] leading-tight text-[#1A2E5A] text-balance">
          Prenota per il tuo{" "}
          <span className="text-c-amber">amico a 4 zampe</span>
        </h1>
        <p className="mb-4 text-sm text-[#1A2E5A]/70">
          Toelettatura professionale · Facile e veloce
        </p>

        <button
          type="button"
          onClick={onStart}
          className="rounded-full bg-c-amber px-7 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#2e90c4]"
        >
          Prenota ora
        </button>
      </div>
    </div>
  )
}
