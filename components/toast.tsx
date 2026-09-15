import { cn } from "@/lib/utils"

export function Toast({ message, show }: { message: string; show: boolean }) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        "fixed bottom-6 left-1/2 z-[300] -translate-x-1/2 whitespace-nowrap rounded-full bg-brown px-5 py-3 text-[13px] text-cream shadow-lg transition-transform duration-300",
        show ? "translate-y-0" : "translate-y-24",
      )}
    >
      {message}
    </div>
  )
}
