import { ArrowDown, ArrowUp } from 'lucide-react'
import { formatDisplayDate } from '../lib/dates'
import { getCategoryIcon } from '../lib/icons'
import { formatSignedRupiah } from '../lib/money'
import { groupByDate } from '../lib/summary'
import type { Transaction } from '../types'

interface TransactionListProps {
  transactions: Transaction[]
  grouped?: boolean
  onSelect?(t: Transaction): void
}

function Row({ t, showDate, onSelect }: { t: Transaction; showDate: boolean; onSelect?(t: Transaction): void }) {
  const Icon = getCategoryIcon(t.categoryIcon)
  const Arrow = t.type === 'expense' ? ArrowDown : ArrowUp
  const color = t.type === 'expense' ? 'text-expense' : 'text-income'
  const content = (
    <>
      <span
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-white"
        style={{ backgroundColor: t.categoryColor }}
      >
        <Icon size={20} aria-hidden />
      </span>
      <span className="min-w-0 flex-1 text-left">
        <span className="block truncate font-medium">{t.categoryName}</span>
        {(t.note || showDate) && (
          <span className="block truncate text-sm text-muted">
            {[showDate ? formatDisplayDate(t.date) : null, t.note].filter(Boolean).join(' · ')}
          </span>
        )}
      </span>
      <span className={`num flex shrink-0 items-center gap-1 font-semibold ${color}`}>
        <Arrow size={14} aria-hidden />
        {formatSignedRupiah(t.amount, t.type)}
      </span>
    </>
  )
  const className = 'flex w-full items-center gap-3 rounded-xl px-2 py-2.5'
  return (
    <li>
      {onSelect ? (
        <button type="button" className={`${className} hover:bg-surface`} onClick={() => onSelect(t)}>
          {content}
        </button>
      ) : (
        <div className={className}>{content}</div>
      )}
    </li>
  )
}

export function TransactionList({ transactions, grouped, onSelect }: TransactionListProps) {
  if (transactions.length === 0) {
    return <p className="py-6 text-center text-muted">No transactions yet</p>
  }
  if (!grouped) {
    return (
      <ul className="space-y-1">
        {transactions.map((t) => <Row key={t.id} t={t} showDate onSelect={onSelect} />)}
      </ul>
    )
  }
  return (
    <div className="space-y-4">
      {groupByDate(transactions).map((g) => (
        <section key={g.date}>
          <h3 className="mb-1 px-2 text-sm font-semibold text-muted">{formatDisplayDate(g.date)}</h3>
          <ul className="space-y-1">
            {g.items.map((t) => <Row key={t.id} t={t} showDate={false} onSelect={onSelect} />)}
          </ul>
        </section>
      ))}
    </div>
  )
}
