import Image from "next/image"
import { BookOpen, Calendar, MapPin, MessageCircle, Phone, type LucideIcon } from "lucide-react"
import { contact, shop } from "@/lib/booking-data"

type BookingHeroProps = {
  onStart: () => void
  onCatalog: () => void
}

export function BookingHero({ onStart, onCatalog }: BookingHeroProps) {
  return (
    <div className="relative min-h-dvh overflow-hidden bg-gradient-to-b from-c-amber-bright to-c-amber-pale px-5 pb-10 pt-7 text-center">
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(circle at 15% 20%, rgba(255,255,255,0.5), transparent 22%), radial-gradient(circle at 85% 15%, rgba(255,255,255,0.4), transparent 18%)",
        }}
        aria-hidden="true"
      />

      <div className="relative mx-auto flex max-w-[380px] flex-col items-center">
        <div className="mb-5 w-full overflow-hidden rounded-2xl shadow-md ring-1 ring-white/60">
          <Image
            src="/images/misterdog-hero.jpeg"
            alt="Mister Dog Pet Salon"
            width={1200}
            height={800}
            className="h-auto w-full object-cover"
            priority
          />
        </div>

        <div className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-c-brown/15 bg-white/70 px-3.5 py-1.5 text-xs font-medium text-c-brown">
          <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
          {shop.name} · {shop.city}
        </div>

        <h1 className="mb-2 font-display text-[27px] leading-tight text-c-brown text-balance">
          Prenota per il tuo{" "}
          <span className="text-c-amber">amico a 4 zampe</span>
        </h1>
        <p className="mb-6 text-sm leading-relaxed text-c-brown/70">
          Toelettatura professionale · Facile e veloce
        </p>

        <div className="flex w-full flex-col gap-4">
          <BubbleButton
            label="Catalogo"
            icon={BookOpen}
            onClick={onCatalog}
            className="bg-c-amber shadow-[0_5px_0_var(--c-sage),0_10px_18px_rgba(26,46,90,0.18)]"
          />
          <BubbleButton
            label="Prenota"
            icon={Calendar}
            onClick={onStart}
            className="bg-c-brown shadow-[0_5px_0_#0f1d3d,0_10px_18px_rgba(26,46,90,0.25)]"
          />
        </div>

        <div className="mt-7 flex items-start justify-center gap-8">
          <ContactIcon href={contact.whatsappHref} label="WhatsApp" icon={MessageCircle} external />
          <ContactIcon href={contact.phoneHref} label="Chiama" icon={Phone} />
        </div>
      </div>
    </div>
  )
}

function BubbleButton({
  label,
  icon: Icon,
  onClick,
  className,
}: {
  label: string
  icon: LucideIcon
  onClick: () => void
  className: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative flex w-full items-center justify-center gap-2.5 overflow-hidden rounded-2xl py-4 text-base font-semibold text-white transition-all active:translate-y-1 active:shadow-none ${className}`}
    >
      <span
        className="pointer-events-none absolute inset-x-3 top-1 h-2/5 rounded-xl bg-gradient-to-b from-white/35 to-white/5"
        aria-hidden="true"
      />
      <Icon className="relative h-5 w-5" aria-hidden="true" />
      <span className="relative">{label}</span>
    </button>
  )
}

function ContactIcon({
  href,
  label,
  icon: Icon,
  external,
}: {
  href: string
  label: string
  icon: LucideIcon
  external?: boolean
}) {
  return (
    <a
      href={href}
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      className="flex flex-col items-center gap-1.5 text-xs font-medium text-c-brown"
    >
      <span className="flex h-14 w-14 items-center justify-center rounded-full bg-white text-c-sage shadow-md ring-1 ring-c-border transition-transform active:scale-95">
        <Icon className="h-6 w-6" aria-hidden="true" />
      </span>
      {label}
    </a>
  )
}
