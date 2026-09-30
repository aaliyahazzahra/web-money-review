import { dangerButton, secondaryButton } from './ui'

interface ConfirmDialogProps {
  open: boolean
  title: string
  message?: string
  confirmLabel: string
  busy?: boolean
  onConfirm(): void
  onCancel(): void
}

export function ConfirmDialog({ open, title, message, confirmLabel, busy, onConfirm, onCancel }: ConfirmDialogProps) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4" onClick={onCancel}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-title"
        className="w-full max-w-sm rounded-2xl bg-bg p-5 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="confirm-title" className="text-lg font-semibold">{title}</h2>
        {message && <p className="mt-2 text-sm text-muted">{message}</p>}
        <div className="mt-5 flex justify-end gap-2">
          <button type="button" className={secondaryButton} onClick={onCancel}>Cancel</button>
          <button type="button" className={dangerButton} onClick={onConfirm} disabled={busy}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
