import { BookOpen, Calendar, Phone } from "lucide-react"

type HomeViewProps = {
  onBook: () => void
  onCatalog: () => void
  onCall: () => void
}

export function HomeView({ onBook, onCatalog, onCall }: HomeViewProps) {
  const actions = [
    { label: "Prenota", icon: Calendar, onClick: onBook },
    { label: "Catalogo", icon: BookOpen, onClick: onCatalog },
    { label: "Chiama", icon: Phone, onClick: onCall },
  ]
  return (
    <div className="flex gap-2.5 pb-2 pt-4">
      {actions.map(({ label, icon: Icon, onClick }) => (
        <button
          key={label}
          type="button"
          onClick={onClick}
          className="flex-1 rounded-[14px] border border-c-border bg-white p-3.5 text-center transition-colors hover:border-c-amber"
        >
          <Icon className="mx-auto mb-1 h-5 w-5 text-c-brown" aria-hidden="true" />
          <div className="text-xs font-medium text-c-brown">{label}</div>
        </button>
      ))}
    </div>
  )
}
