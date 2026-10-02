export type CustomerDetails = { customerName: string; phone: string; dogName: string }

type DetailsStepProps = {
  petLabel: string
  value: CustomerDetails
  onChange: (value: CustomerDetails) => void
  error?: string | null
  onSubmit: () => void
}

const fields: {
  key: keyof CustomerDetails
  label: string
  type: string
  autoComplete: string
  inputMode?: "tel" | "text"
  placeholder: string
}[] = [
  { key: "customerName", label: "Il tuo nome", type: "text", autoComplete: "name", placeholder: "Nome e cognome" },
  { key: "phone", label: "Telefono", type: "tel", autoComplete: "tel", inputMode: "tel", placeholder: "Es. 347 123 4567" },
  { key: "dogName", label: "Nome del cane", type: "text", autoComplete: "off", placeholder: "Come si chiama?" },
]

export function DetailsStep({ petLabel, value, onChange, error, onSubmit }: DetailsStepProps) {
  return (
    <section aria-labelledby="details-title">
      <h2 id="details-title" className="mb-1 font-display text-xl text-c-brown">
        I tuoi dati
      </h2>
      <p className="mb-4 text-sm leading-relaxed text-c-gray">
        Nessuna registrazione: ci servono solo per confermarti l&apos;appuntamento.
      </p>
      <form
        id="details-form"
        noValidate
        onSubmit={(e) => {
          e.preventDefault()
          onSubmit()
        }}
        className="flex flex-col gap-4 rounded-[18px] border border-c-border bg-white p-5"
      >
        {fields.map((f) => (
          <label key={f.key} className="flex flex-col gap-1.5 text-sm font-medium text-c-brown">
            {f.key === "dogName" ? `Nome del ${petLabel}` : f.label}
            <input
              name={f.key}
              type={f.type}
              inputMode={f.inputMode}
              autoComplete={f.autoComplete}
              placeholder={f.placeholder}
              required
              maxLength={f.key === "phone" ? 30 : 80}
              value={value[f.key]}
              onChange={(e) => onChange({ ...value, [f.key]: e.target.value })}
              className="rounded-[10px] border border-c-border bg-white px-3.5 py-2.5 text-base font-normal text-c-brown outline-none transition-colors placeholder:text-c-gray/70 focus:border-c-amber"
            />
          </label>
        ))}
        {error && (
          <p role="alert" className="rounded-lg bg-c-amber-pale px-3 py-2 text-sm text-c-brown">
            {error}
          </p>
        )}
      </form>
    </section>
  )
}
