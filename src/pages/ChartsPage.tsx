import { useState } from 'react'
import { ExpenseDonut } from '../components/charts/ExpenseDonut'
import { MonthlyBars } from '../components/charts/MonthlyBars'
import { MonthPicker } from '../components/MonthPicker'
import { PageTitle } from '../components/PageTitle'
import { QueryState } from '../components/QueryState'
import { card } from '../components/ui'
import { useTransactions } from '../hooks/useTransactions'
import { useChartColors } from '../lib/chartTheme'
import { currentMonthKey, formatMonthLabel, lastNMonths, monthRange } from '../lib/dates'
import { expenseByCategory, monthlySeries } from '../lib/summary'

const MONTHS = 6

export function ChartsPage() {
  const [month, setMonth] = useState(currentMonthKey)
  const months = lastNMonths(month, MONTHS)
  const transactions = useTransactions({ from: monthRange(months[0]).from, to: monthRange(month).to })
  const colors = useChartColors()
  const all = transactions.data ?? []
  const selected = all.filter((t) => t.date.startsWith(month))

  return (
    <div className="space-y-4">
      <PageTitle>Charts</PageTitle>
      <MonthPicker value={month} onChange={setMonth} />

      <QueryState isLoading={transactions.isLoading} isError={transactions.isError} onRetry={() => transactions.refetch()} rows={4}>
        <div className="grid gap-4 lg:grid-cols-2">
          <section className={card} aria-labelledby="donut-title">
            <h2 id="donut-title" className="mb-4 font-semibold">Expense by category · {formatMonthLabel(month)}</h2>
            <ExpenseDonut data={expenseByCategory(selected)} colors={colors} />
          </section>
          <section className={card} aria-labelledby="bars-title">
            <h2 id="bars-title" className="mb-2 font-semibold">Income vs expense · last {MONTHS} months</h2>
            <MonthlyBars data={monthlySeries(all, months)} colors={colors} />
          </section>
        </div>
      </QueryState>
    </div>
  )
}
