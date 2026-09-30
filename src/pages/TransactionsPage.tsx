import { useState } from 'react'
import { PageTitle } from '../components/PageTitle'
import { ConfirmDialog } from '../components/ConfirmDialog'
import { EditTransactionSheet } from '../components/EditTransactionSheet'
import { MonthPicker } from '../components/MonthPicker'
import { QueryState } from '../components/QueryState'
import { useToast } from '../components/Toast'
import { TransactionList } from '../components/TransactionList'
import { input } from '../components/ui'
import { useCategories } from '../hooks/useCategories'
import { useDeleteTransaction, useSaveTransaction, useTransactions } from '../hooks/useTransactions'
import { currentMonthKey, monthRange } from '../lib/dates'
import type { Transaction, TransactionInput } from '../types'

export function TransactionsPage() {
  const [month, setMonth] = useState(currentMonthKey)
  const [categoryId, setCategoryId] = useState<number | undefined>(undefined)
  const [editing, setEditing] = useState<Transaction | null>(null)
  const [confirmingDelete, setConfirmingDelete] = useState(false)

  const transactions = useTransactions({ ...monthRange(month), categoryId })
  const categories = useCategories()
  const save = useSaveTransaction()
  const remove = useDeleteTransaction()
  const toast = useToast()

  async function handleSave(inputValue: TransactionInput) {
    if (!editing) return
    try {
      await save.mutateAsync({ id: editing.id, input: inputValue })
      toast.show('Saved')
      setEditing(null)
    } catch (err) {
      toast.show('Failed to save, try again', 'error')
      throw err
    }
  }

  async function handleDelete() {
    if (!editing) return
    try {
      await remove.mutateAsync(editing.id)
      toast.show('Transaction deleted')
      setEditing(null)
    } catch {
      toast.show('Failed to delete, try again', 'error')
    } finally {
      setConfirmingDelete(false)
    }
  }

  return (
    <div className="space-y-4">
      <PageTitle>Transactions</PageTitle>

      <div className="flex flex-wrap items-center gap-2">
        <MonthPicker value={month} onChange={setMonth} />
        <select
          aria-label="Category filter"
          className={`${input} w-auto flex-1 sm:flex-none`}
          value={categoryId ?? ''}
          onChange={(e) => setCategoryId(e.target.value === '' ? undefined : Number(e.target.value))}
        >
          <option value="">All categories</option>
          {(categories.data ?? []).map((c) => (
            <option key={c.id} value={c.id}>
              {c.archived ? `${c.name} (archived)` : c.name}
            </option>
          ))}
        </select>
      </div>

      <QueryState isLoading={transactions.isLoading} isError={transactions.isError} hasData={transactions.data !== undefined} onRetry={() => transactions.refetch()} rows={5}>
        <TransactionList transactions={transactions.data ?? []} grouped onSelect={setEditing} />
      </QueryState>

      <EditTransactionSheet
        transaction={editing}
        categories={categories.data ?? []}
        onSubmit={handleSave}
        onDelete={() => setConfirmingDelete(true)}
        onClose={() => setEditing(null)}
      />
      <ConfirmDialog
        open={confirmingDelete}
        title="Delete transaction?"
        confirmLabel="Delete"
        busy={remove.isPending}
        onConfirm={handleDelete}
        onCancel={() => setConfirmingDelete(false)}
      />
    </div>
  )
}
