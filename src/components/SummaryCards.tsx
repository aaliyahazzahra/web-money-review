import { ArrowDown, ArrowUp, Scale } from 'lucide-react'
import { formatRupiah, formatSignedRupiah } from '../lib/money'

interface SummaryCardsProps {
  income: number
  expense: number
  net: number
}

export function SummaryCards({ income, expense, net }: SummaryCardsProps) {
  return (
    <div className="grid grid-cols-2 gap-2">
      <div className="col-span-2 rounded-2xl bg-primary p-4 text-on-primary">
        <p className="flex items-center gap-1.5 text-sm opacity-85">
          <Scale size={16} aria-hidden /> Net
        </p>
        <p className="num mt-1 text-3xl font-bold">
          {net < 0 ? formatSignedRupiah(-net, 'expense') : formatRupiah(net)}
        </p>
      </div>
      <div className="rounded-2xl bg-surface p-3">
        <p className="flex items-center gap-1 text-sm text-muted">
          <ArrowUp size={16} aria-hidden className="text-income" /> Income
        </p>
        <p className="num mt-1 text-lg font-semibold text-income">{formatRupiah(income)}</p>
      </div>
      <div className="rounded-2xl bg-surface p-3">
        <p className="flex items-center gap-1 text-sm text-muted">
          <ArrowDown size={16} aria-hidden className="text-expense" /> Expense
        </p>
        <p className="num mt-1 text-lg font-semibold text-expense">{formatRupiah(expense)}</p>
      </div>
    </div>
  )
}
