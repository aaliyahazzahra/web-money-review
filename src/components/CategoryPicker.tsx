import { getCategoryIcon } from '../lib/icons'
import type { Category, TransactionType } from '../types'
import { fieldError, label } from './ui'

interface CategoryPickerProps {
  categories: Category[]
  type: TransactionType
  value: number | null
  onChange(id: number): void
  error?: string
}

export function CategoryPicker({ categories, type, value, onChange, error }: CategoryPickerProps) {
  // Kategori terarsip disembunyikan, kecuali yang sedang dipakai transaksi yang diedit.
  const options = categories.filter((c) => c.type === type && (!c.archived || c.id === value))

  return (
    <div>
      <p className={label} id="category-label">Category</p>
      <div role="group" aria-labelledby="category-label" className="grid grid-cols-3 gap-2 sm:grid-cols-4">
        {options.map((c) => {
          const Icon = getCategoryIcon(c.icon)
          const selected = c.id === value
          return (
            <button
              key={c.id}
              type="button"
              aria-pressed={selected}
              onClick={() => onChange(c.id)}
              className={`flex flex-col items-center gap-1 rounded-xl border px-2 py-2.5 text-xs font-medium transition-colors ${
                selected ? 'border-primary bg-primary text-on-primary' : 'border-border bg-bg text-text hover:bg-surface'
              }`}
            >
              <Icon size={20} aria-hidden />
              <span className="line-clamp-2 text-center leading-tight">{c.name}</span>
            </button>
          )
        })}
      </div>
      {options.length === 0 && <p className="text-sm text-muted">No categories yet. Add one in Settings.</p>}
      {error && <p className={fieldError}>{error}</p>}
    </div>
  )
}
