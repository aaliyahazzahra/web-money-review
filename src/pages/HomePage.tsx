import { Link } from 'react-router'
import { PageTitle } from '../components/PageTitle'
import { QueryState } from '../components/QueryState'
import { SummaryCards } from '../components/SummaryCards'
import { useToast } from '../components/Toast'
import { TransactionForm } from '../components/TransactionForm'
import { TransactionList } from '../components/TransactionList'
import { card } from '../components/ui'
import { useCategories } from '../hooks/useCategories'
import { useAllTimeBalance, useRecentTransactions, useSaveTransaction, useTransactions } from '../hooks/useTransactions'
import { currentMonthKey, formatMonthLabel, monthRange } from '../lib/dates'
import { monthlySummary } from '../lib/summary'
import type { TransactionInput } from '../types'

export function HomePage() {
  const month = currentMonthKey()
  const monthTx = useTransactions(monthRange(month))
  const balance = useAllTimeBalance()
  const recent = useRecentTransactions()
  const categories = useCategories()
  const save = useSaveTransaction()
  const toast = useToast()

  const { income, expense } = monthlySummary(monthTx.data ?? [])
  const { net: balanceNet } = monthlySummary(balance.data ?? [])

  async function handleSubmit(input: TransactionInput) {
    try {
      await save.mutateAsync({ input })
      toast.show('Transaction added')
    } catch (err) {
      toast.show('Failed to save, try again', 'error')
      throw err
    }
  }

  return (
    <div className="space-y-6">
      <PageTitle>{formatMonthLabel(month)}</PageTitle>

      <QueryState
        isLoading={monthTx.isLoading || balance.isLoading}
        isError={monthTx.isError || balance.isError}
        hasData={monthTx.data !== undefined && balance.data !== undefined}
        onRetry={() => {
          monthTx.refetch()
          balance.refetch()
        }}
        rows={1}
      >
        <SummaryCards income={income} expense={expense} balance={balanceNet} />
      </QueryState>

      <section className={card} aria-label="Add transaction">
        <QueryState isLoading={categories.isLoading} isError={categories.isError} hasData={categories.data !== undefined} onRetry={() => categories.refetch()}>
          <TransactionForm categories={categories.data ?? []} onSubmit={handleSubmit} />
        </QueryState>
      </section>

      <section>
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Recent</h2>
          <Link to="/transactions" className="text-sm font-medium text-primary">See all</Link>
        </div>
        <QueryState isLoading={recent.isLoading} isError={recent.isError} hasData={recent.data !== undefined} onRetry={() => recent.refetch()}>
          <TransactionList transactions={recent.data ?? []} />
        </QueryState>
      </section>
    </div>
  )
}
