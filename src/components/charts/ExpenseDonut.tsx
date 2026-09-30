import { ArcElement, Chart as ChartJS, Tooltip } from 'chart.js'
import { Doughnut } from 'react-chartjs-2'
import { categoryColorFor } from '../../lib/icons'
import { formatRupiah } from '../../lib/money'
import { collapseCategories, type CategoryTotal } from '../../lib/summary'
import type { ChartColors } from '../../lib/chartTheme'

ChartJS.register(ArcElement, Tooltip)

/** Irisan maksimum; sisanya digabung menjadi "Other" supaya warna tetap bisa dibedakan. */
const MAX_SLICES = 7

interface ExpenseDonutProps {
  data: CategoryTotal[]
  colors: ChartColors
}

export function ExpenseDonut({ data, colors }: ExpenseDonutProps) {
  if (data.length === 0) {
    return <p className="py-10 text-center text-muted">No expenses this month</p>
  }
  const rows = collapseCategories(data, MAX_SLICES)
  const fills = rows.map((r) => categoryColorFor(r.color, colors.theme))
  const total = rows.reduce((sum, r) => sum + r.total, 0)

  return (
    <div className="flex flex-col items-center gap-5">
      <div className="relative h-52 w-52 shrink-0">
        <Doughnut
          data={{
            labels: rows.map((r) => r.name),
            datasets: [{
              data: rows.map((r) => r.total),
              backgroundColor: fills,
              borderColor: colors.surface,
              borderWidth: 2,
              hoverOffset: 4,
            }],
          }}
          options={{
            cutout: '68%',
            maintainAspectRatio: false,
            plugins: {
              legend: { display: false },
              tooltip: { callbacks: { label: (ctx) => ` ${formatRupiah(ctx.parsed)}` } },
            },
          }}
        />
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-xs text-muted">Total</span>
          <span className="num text-sm font-bold">{formatRupiah(total)}</span>
        </div>
      </div>
      <ul aria-label="Expense by category" className="w-full max-w-md space-y-1.5">
        {rows.map((r, i) => (
          <li key={r.categoryId} className="flex items-center gap-2 text-sm">
            <span className="h-3 w-3 shrink-0 rounded-sm" style={{ backgroundColor: fills[i] }} aria-hidden />
            <span className="min-w-0 flex-1 truncate">{r.name}</span>
            <span className="num font-medium">{formatRupiah(r.total)}</span>
            <span className="num w-12 text-right text-muted">{`${r.percent}%`}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
