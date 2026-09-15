"use client"

import { AlertTriangle } from "lucide-react"

type ConfirmDialogProps = {
  open: boolean
  title: string
  message: string
  confirmLabel?: string
  cancelLabel?: string
  onConfirm: () => void
  onCancel: () => void
}

export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = "Elimina",
  cancelLabel = "Annulla",
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-[200] flex items-end justify-center bg-black/40 px-4 pb-8 sm:items-center sm:pb-0"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-title"
      onClick={onCancel}
    >
      <div
        className="w-full max-w-[380px] rounded-2xl border border-border bg-card p-5 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-3 flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-destructive/10 text-destructive">
            <AlertTriangle className="h-5 w-5" aria-hidden="true" />
          </span>
          <h2 id="confirm-title" className="font-serif text-lg text-brown">
            {title}
          </h2>
        </div>
        <p className="mb-5 text-sm leading-relaxed text-warm-gray">{message}</p>
        <div className="flex gap-2.5">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 rounded-xl border border-border bg-card py-2.5 text-sm font-medium text-brown transition-colors hover:bg-muted"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="flex-1 rounded-xl bg-destructive py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
