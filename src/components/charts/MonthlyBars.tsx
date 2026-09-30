import { BarElement, CategoryScale, Chart as ChartJS, Legend, LinearScale, Tooltip } from 'chart.js'
import { Bar } from 'react-chartjs-2'
import type { ChartColors } from '../../lib/chartTheme'
import { formatMonthLabel } from '../../lib/dates'
import { formatRupiah } from '../../lib/money'
import type { MonthPoint } from '../../lib/summary'

ChartJS.register(BarElement, CategoryScale, LinearScale, Legend, Tooltip)

/** Sumbu y ringkas: 1.500.000 -> "1,5 jt". */
function compactRupiah(value: number): string {
  if (value >= 1_000_000_000) return `${(value / 1_000_000_000).toLocaleString('id-ID', { maximumFractionDigits: 1 })} M`
  if (value >= 1_000_000) return `${(value / 1_000_000).toLocaleString('id-ID', { maximumFractionDigits: 1 })} jt`
  if (value >= 1_000) return `${(value / 1_000).toLocaleString('id-ID', { maximumFractionDigits: 0 })} rb`
  return String(value)
}

interface MonthlyBarsProps {
  data: MonthPoint[]
  colors: ChartColors
}

export function MonthlyBars({ data, colors }: MonthlyBarsProps) {
  const bar = { borderRadius: 4, borderSkipped: 'bottom' as const, maxBarThickness: 22, borderWidth: 0 }
  return (
    <div className="h-72">
      <Bar
        data={{
          labels: data.map((p) => formatMonthLabel(p.month)),
          datasets: [
            { label: 'Income', data: data.map((p) => p.income), backgroundColor: colors.income, ...bar },
            { label: 'Expense', data: data.map((p) => p.expense), backgroundColor: colors.expense, ...bar },
          ],
        }}
        options={{
          maintainAspectRatio: false,
          interaction: { mode: 'index', intersect: false },
          datasets: { bar: { categoryPercentage: 0.7, barPercentage: 0.85 } },
          scales: {
            x: { grid: { display: false }, ticks: { color: colors.muted }, border: { color: colors.grid } },
            y: {
              beginAtZero: true,
              grid: { color: colors.grid },
              border: { display: false },
              ticks: { color: colors.muted, maxTicksLimit: 5, callback: (v) => compactRupiah(Number(v)) },
            },
          },
          plugins: {
            legend: {
              position: 'top',
              align: 'start',
              labels: { color: colors.text, boxWidth: 12, boxHeight: 12, useBorderRadius: true, borderRadius: 2 },
            },
            tooltip: { callbacks: { label: (ctx) => ` ${ctx.dataset.label}: ${formatRupiah(ctx.parsed.y ?? 0)}` } },
          },
        }}
      />
    </div>
  )
}
