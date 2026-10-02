"use client"

import { useState } from "react"
import { ArrowLeft, Cat, ChevronRight, Dog, MessageCircle, Phone, Rabbit, type LucideIcon } from "lucide-react"
import { contact } from "@/lib/booking-data"
import type { Pet } from "@/lib/services"

type AnimalViewProps = {
  onBack: () => void
  onSelect: (pet: Pet) => void
}

export function AnimalView({ onBack, onSelect }: AnimalViewProps) {
  const [showOther, setShowOther] = useState(false)

  return (
    <div className="pt-4">
      <button
        type="button"
        onClick={onBack}
        className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-c-gray transition-colors hover:text-c-brown"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Indietro
      </button>

      <h1 className="font-display text-[26px] leading-tight text-c-brown text-balance">
        Chi porti da noi?
      </h1>
      <p className="mb-5 mt-1 text-sm leading-relaxed text-c-gray">
        Scegli l&apos;animale per vedere i servizi disponibili.
      </p>

      <div className="flex flex-col gap-3">
        <AnimalCard icon={Dog} label="Cane" hint="Bagno, tosatura e pulizia denti" onClick={() => onSelect("cane")} />
        <AnimalCard icon={Cat} label="Gatto" hint="Bagno pelo corto o lungo" onClick={() => onSelect("gatto")} />
        <AnimalCard
          icon={Rabbit}
          label="Altro"
          hint="Coniglio, furetto e altri animali"
          onClick={() => setShowOther((v) => !v)}
          expanded={showOther}
        />
      </div>

      {showOther && (
        <div
          id="other-contact"
          className="mt-3 rounded-[18px] border border-c-border bg-c-amber-pale p-4"
          role="region"
          aria-label="Contatti per altri animali"
        >
          <p className="mb-3 text-sm leading-relaxed text-c-brown">
            Per altri animali ci organizziamo insieme: scrivici o chiamaci e troviamo il servizio giusto.
          </p>
          <div className="flex gap-2.5">
            <a
              href={contact.whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-1 items-center justify-center gap-2 rounded-[14px] bg-c-sage py-3 text-sm font-semibold text-white transition-opacity active:opacity-80"
            >
              <MessageCircle className="h-4 w-4" aria-hidden="true" />
              WhatsApp
            </a>
            <a
              href={contact.phoneHref}
              className="flex flex-1 items-center justify-center gap-2 rounded-[14px] bg-c-brown py-3 text-sm font-semibold text-white transition-opacity active:opacity-80"
            >
              <Phone className="h-4 w-4" aria-hidden="true" />
              Chiama
            </a>
          </div>
        </div>
      )}
    </div>
  )
}

function AnimalCard({
  icon: Icon,
  label,
  hint,
  onClick,
  expanded,
}: {
  icon: LucideIcon
  label: string
  hint: string
  onClick: () => void
  expanded?: boolean
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      {...(expanded !== undefined ? { "aria-expanded": expanded, "aria-controls": "other-contact" } : {})}
      className={[
        "flex items-center gap-4 rounded-[18px] border bg-white p-4 text-left transition-colors",
        expanded ? "border-c-amber ring-2 ring-c-amber/30" : "border-c-border hover:border-c-amber",
      ].join(" ")}
    >
      <span className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl bg-c-amber-pale text-c-brown">
        <Icon className="h-7 w-7" aria-hidden="true" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block font-display text-lg text-c-brown">{label}</span>
        <span className="block text-xs leading-relaxed text-c-gray">{hint}</span>
      </span>
      <ChevronRight
        className={["h-5 w-5 flex-shrink-0 text-c-gray transition-transform", expanded ? "rotate-90" : ""].join(" ")}
        aria-hidden="true"
      />
    </button>
  )
}
