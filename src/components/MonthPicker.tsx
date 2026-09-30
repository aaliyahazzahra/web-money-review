import { ChevronLeft, ChevronRight } from 'lucide-react'
import { formatMonthLabel, shiftMonth } from '../lib/dates'
import { iconButton } from './ui'

interface MonthPickerProps {
  value: string
  onChange(monthKey: string): void
}

export function MonthPicker({ value, onChange }: MonthPickerProps) {
  return (
    <div className="inline-flex items-center gap-1 rounded-xl bg-surface p-1">
      <button type="button" className={iconButton} aria-label="Previous month" onClick={() => onChange(shiftMonth(value, -1))}>
        <ChevronLeft size={20} aria-hidden />
      </button>
      <span className="min-w-24 text-center font-semibold" aria-live="polite">{formatMonthLabel(value)}</span>
      <button type="button" className={iconButton} aria-label="Next month" onClick={() => onChange(shiftMonth(value, 1))}>
        <ChevronRight size={20} aria-hidden />
      </button>
    </div>
  )
}
