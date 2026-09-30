import { CircleAlert, CircleCheck } from 'lucide-react'
import { createContext, type ReactNode, useCallback, useContext, useEffect, useRef, useState } from 'react'

type ToastKind = 'success' | 'error'
interface ToastState {
  id: number
  message: string
  kind: ToastKind
}
interface ToastApi {
  show(message: string, kind?: ToastKind): void
}

const ToastContext = createContext<ToastApi | null>(null)
const DURATION_MS = 3000

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<ToastState | null>(null)
  const nextId = useRef(0)

  const show = useCallback((message: string, kind: ToastKind = 'success') => {
    nextId.current += 1
    setToast({ id: nextId.current, message, kind })
  }, [])

  useEffect(() => {
    if (!toast) return
    const timer = setTimeout(() => setToast(null), DURATION_MS)
    return () => clearTimeout(timer)
  }, [toast])

  const Icon = toast?.kind === 'error' ? CircleAlert : CircleCheck

  return (
    <ToastContext.Provider value={{ show }}>
      {children}
      <div
        role="status"
        aria-live="polite"
        className="pointer-events-none fixed inset-x-0 bottom-20 z-50 flex justify-center px-4 md:bottom-6"
      >
        {toast && (
          <div
            key={toast.id}
            className="flex items-center gap-2 rounded-xl bg-text px-4 py-2.5 text-sm font-medium text-bg shadow-lg"
          >
            <Icon size={18} aria-hidden className={toast.kind === 'error' ? 'text-accent' : 'text-income'} />
            {toast.message}
          </div>
        )}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast(): ToastApi {
  const api = useContext(ToastContext)
  if (!api) throw new Error('useToast must be used inside ToastProvider')
  return api
}
