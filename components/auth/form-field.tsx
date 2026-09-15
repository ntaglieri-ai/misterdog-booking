import type { ReactNode } from "react"

const fieldClasses =
  "w-full rounded-[12px] border border-c-border bg-white px-4 py-3 text-sm text-c-brown outline-none transition-colors placeholder:text-c-gray/60 focus:border-c-amber"

type FieldWrapperProps = {
  id: string
  label: string
  children: ReactNode
}

function FieldWrapper({ id, label, children }: FieldWrapperProps) {
  return (
    <div className="mb-3.5">
      <label
        htmlFor={id}
        className="mb-1.5 block text-[13px] font-medium text-c-brown"
      >
        {label}
      </label>
      {children}
    </div>
  )
}

type InputFieldProps = {
  id: string
  label: string
  type?: string
  placeholder?: string
  autoComplete?: string
  required?: boolean
}

export function InputField({
  id,
  label,
  type = "text",
  placeholder,
  autoComplete,
  required = true,
}: InputFieldProps) {
  return (
    <FieldWrapper id={id} label={label}>
      <input
        id={id}
        name={id}
        type={type}
        placeholder={placeholder}
        autoComplete={autoComplete}
        required={required}
        className={fieldClasses}
      />
    </FieldWrapper>
  )
}

type SelectFieldProps = {
  id: string
  label: string
  options: { value: string; label: string }[]
}

export function SelectField({ id, label, options }: SelectFieldProps) {
  return (
    <FieldWrapper id={id} label={label}>
      <select id={id} name={id} required className={fieldClasses} defaultValue="">
        <option value="" disabled>
          Seleziona…
        </option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </FieldWrapper>
  )
}
