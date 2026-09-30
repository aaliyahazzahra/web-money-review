import { formatAmountInput, parseAmountInput } from '../lib/money'
import { fieldError, label } from './ui'

interface AmountInputProps {
  value: number | null
  onChange(value: number | null): void
  error?: string
}

export function AmountInput({ value, onChange, error }: AmountInputProps) {
  function handleChange(raw: string) {
    const parsed = parseAmountInput(raw)
    // Berisi digit tapi null berarti melebihi batas maksimum: abaikan ketikan terakhir.
    if (parsed === null && /\d/.test(raw)) return
    onChange(parsed)
  }

  return (
    <div>
      <label htmlFor="amount" className={label}>Amount</label>
      <div
        className={`flex items-center rounded-xl border bg-bg px-3 focus-within:ring-2 focus-within:ring-primary/25 ${
          error ? 'border-expense' : 'border-border focus-within:border-primary'
        }`}
      >
        <span className="mr-2 text-lg font-semibold text-muted">Rp</span>
        <input
          id="amount"
          inputMode="numeric"
          autoComplete="off"
          placeholder="0"
          className="num w-full bg-transparent py-3 text-2xl font-bold text-text outline-none placeholder:text-muted/50"
          value={formatAmountInput(value)}
          onChange={(e) => handleChange(e.target.value)}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? 'amount-error' : undefined}
        />
      </div>
      {error && <p id="amount-error" className={fieldError}>{error}</p>}
    </div>
  )
}
