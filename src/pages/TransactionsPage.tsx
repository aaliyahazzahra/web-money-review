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
import { currentMonthKey, formatMonthLabel, monthRange } from '../lib/dates'
import type { Category, Transaction, TransactionInput, TransactionType } from '../types'

type TypeFilter = TransactionType | 'all'

const TYPE_OPTIONS: { value: TypeFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'expense', label: 'Expense' },
  { value: 'income', label: 'Income' },
]

const CATEGORY_GROUPS: { type: TransactionType; label: string }[] = [
  { type: 'expense', label: 'Expense' },
  { type: 'income', label: 'Income' },
]

function categoryLabel(c: Category): string {
  return c.archived ? `${c.name} (archived)` : c.name
}

/** Pesan daftar kosong sesuai filter aktif, mis. "No transactions for Mom in Oct 2026". */
function emptyMessage(month: string, type: TypeFilter, category: Category | undefined): string {
  const period = formatMonthLabel(month)
  if (category) return `No transactions for ${category.name} in ${period}`
  if (type !== 'all') return `No ${type} transactions in ${period}`
  return `No transactions in ${period}`
}

export function TransactionsPage() {
  const [month, setMonth] = useState(currentMonthKey)
  const [type, setType] = useState<TypeFilter>('all')
  const [categoryId, setCategoryId] = useState<number | undefined>(undefined)
  const [editing, setEditing] = useState<Transaction | null>(null)
  const [confirmingDelete, setConfirmingDelete] = useState(false)

  const transactions = useTransactions({ ...monthRange(month), type: type === 'all' ? undefined : type, categoryId })
  const categories = useCategories()
  const allCategories = categories.data ?? []
  const selectedCategory = allCategories.find((c) => c.id === categoryId)

  function changeType(next: TypeFilter) {
    setType(next)
    // Kategori expense tidak mungkin punya transaksi income (dan sebaliknya), jadi pilihan kategori dilepas.
    if (next !== 'all' && selectedCategory && selectedCategory.type !== next) setCategoryId(undefined)
  }
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
        <div role="radiogroup" aria-label="Type filter" className="inline-flex items-center gap-1 rounded-xl bg-surface p-1">
          {TYPE_OPTIONS.map((o) => (
            <button
              key={o.value}
              type="button"
              role="radio"
              aria-checked={type === o.value}
              onClick={() => changeType(o.value)}
              className={`h-10 rounded-lg px-3 font-medium transition-colors ${
                type === o.value ? 'bg-primary text-on-primary' : 'text-muted hover:text-text'
              }`}
            >
              {o.label}
            </button>
          ))}
        </div>
        <select
          aria-label="Category filter"
          className={`${input} w-auto flex-1 sm:flex-none`}
          value={categoryId ?? ''}
          onChange={(e) => setCategoryId(e.target.value === '' ? undefined : Number(e.target.value))}
        >
          <option value="">All categories</option>
          {type === 'all'
            ? CATEGORY_GROUPS.map((g) => (
                <optgroup key={g.type} label={g.label}>
                  {allCategories.filter((c) => c.type === g.type).map((c) => (
                    <option key={c.id} value={c.id}>{categoryLabel(c)}</option>
                  ))}
                </optgroup>
              ))
            : allCategories.filter((c) => c.type === type).map((c) => (
                <option key={c.id} value={c.id}>{categoryLabel(c)}</option>
              ))}
        </select>
      </div>

      <QueryState isLoading={transactions.isLoading} isError={transactions.isError} hasData={transactions.data !== undefined} onRetry={() => transactions.refetch()} rows={5}>
        <TransactionList
          transactions={transactions.data ?? []}
          grouped
          onSelect={setEditing}
          emptyMessage={emptyMessage(month, type, selectedCategory)}
        />
      </QueryState>

      <EditTransactionSheet
        transaction={editing}
        categories={allCategories}
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
