import { RotateCw } from 'lucide-react'
import type { ReactNode } from 'react'
import { secondaryButton } from './ui'

interface QueryStateProps {
  isLoading: boolean
  isError: boolean
  onRetry(): void
  /** Jumlah baris skeleton saat memuat. */
  rows?: number
  children: ReactNode
}

export function QueryState({ isLoading, isError, onRetry, rows = 3, children }: QueryStateProps) {
  if (isLoading) {
    return (
      <div aria-busy="true" aria-label="Loading" className="space-y-2">
        {Array.from({ length: rows }, (_, i) => (
          <div key={i} className="h-14 animate-pulse rounded-xl bg-surface" />
        ))}
      </div>
    )
  }
  if (isError) {
    return (
      <div className="flex flex-col items-center gap-3 py-6 text-center">
        <p className="text-muted">Couldn't load data</p>
        <button type="button" className={secondaryButton} onClick={onRetry}>
          <RotateCw size={16} aria-hidden /> Retry
        </button>
      </div>
    )
  }
  return <>{children}</>
}
