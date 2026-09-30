import { ArrowDown, ArrowUp, Trash2 } from 'lucide-react'
import { type FormEvent, useRef, useState } from 'react'
import { todayISO } from '../lib/dates'
import type { Category, Transaction, TransactionInput, TransactionType } from '../types'
import { AmountInput } from './AmountInput'
import { CategoryPicker } from './CategoryPicker'
import { dangerButton, input, label, primaryButton } from './ui'

interface TransactionFormProps {
  initial?: Transaction
  categories: Category[]
  /** Melempar error bila gagal; form lalu mempertahankan isinya. */
  onSubmit(input: TransactionInput): Promise<void>
  onDone?(): void
  onDelete?(): void
}

interface Errors {
  amount?: string
  category?: string
}

const TYPES: { value: TransactionType; label: string; icon: typeof ArrowDown }[] = [
  { value: 'expense', label: 'Expense', icon: ArrowDown },
  { value: 'income', label: 'Income', icon: ArrowUp },
]

export function TransactionForm({ initial, categories, onSubmit, onDone, onDelete }: TransactionFormProps) {
  const [type, setType] = useState<TransactionType>(initial?.type ?? 'expense')
  const [amount, setAmount] = useState<number | null>(initial?.amount ?? null)
  const [categoryId, setCategoryId] = useState<number | null>(initial?.categoryId ?? null)
  const [date, setDate] = useState(initial?.date ?? todayISO())
  const [note, setNote] = useState(initial?.note ?? '')
  const [errors, setErrors] = useState<Errors>({})
  const [submitting, setSubmitting] = useState(false)
  // Ref mencegah submit ganda sebelum state "submitting" sempat dirender ulang.
  const inFlight = useRef(false)

  function changeType(next: TransactionType) {
    if (next === type) return
    setType(next)
    setCategoryId(null)
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (inFlight.current) return
    const nextErrors: Errors = {}
    if (!amount) nextErrors.amount = 'Amount is required'
    if (categoryId === null) nextErrors.category = 'Category is required'
    setErrors(nextErrors)
    if (nextErrors.amount || nextErrors.category) return

    inFlight.current = true
    setSubmitting(true)
    try {
      await onSubmit({ type, amount: amount!, categoryId: categoryId!, date, note: note.trim() || null })
      if (!initial) {
        setAmount(null)
        setCategoryId(null)
        setNote('')
      }
      onDone?.()
    } catch {
      // Isi form dipertahankan; pemanggil menampilkan toast.
    } finally {
      inFlight.current = false
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      <div role="radiogroup" aria-label="Type" className="grid grid-cols-2 gap-1 rounded-xl bg-bg p-1">
        {TYPES.map(({ value, label: text, icon: Icon }) => {
          const checked = type === value
          const activeColor = value === 'expense' ? 'text-expense' : 'text-income'
          return (
            <button
              key={value}
              type="button"
              role="radio"
              aria-checked={checked}
              onClick={() => changeType(value)}
              className={`flex items-center justify-center gap-1.5 rounded-lg py-2 text-sm font-semibold ${
                checked ? `bg-surface shadow-sm ${activeColor}` : 'text-muted'
              }`}
            >
              <Icon size={16} aria-hidden /> {text}
            </button>
          )
        })}
      </div>

      <AmountInput value={amount} onChange={setAmount} error={errors.amount} />

      <CategoryPicker
        categories={categories}
        type={type}
        value={categoryId}
        onChange={setCategoryId}
        error={errors.category}
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="date" className={label}>Date</label>
          <input
            id="date"
            type="date"
            required
            className={input}
            value={date}
            onChange={(e) => e.target.value && setDate(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="note" className={label}>Note (optional)</label>
          <input
            id="note"
            maxLength={255}
            className={input}
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
        </div>
      </div>

      <div className="flex gap-2">
        {initial && onDelete && (
          <button type="button" className={dangerButton} onClick={onDelete}>
            <Trash2 size={18} aria-hidden /> Delete
          </button>
        )}
        <button type="submit" className={`${primaryButton} flex-1`} disabled={submitting}>
          Save
        </button>
      </div>
    </form>
  )
}
