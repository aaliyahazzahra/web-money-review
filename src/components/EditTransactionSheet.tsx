import { X } from 'lucide-react'
import type { Category, Transaction, TransactionInput } from '../types'
import { TransactionForm } from './TransactionForm'
import { iconButton } from './ui'

interface EditTransactionSheetProps {
  transaction: Transaction | null
  categories: Category[]
  onSubmit(input: TransactionInput): Promise<void>
  onDelete(): void
  onClose(): void
}

/** Bottom sheet di HP, dialog di tengah layar di laptop. */
export function EditTransactionSheet({ transaction, categories, onSubmit, onDelete, onClose }: EditTransactionSheetProps) {
  if (!transaction) return null
  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center bg-black/50 md:items-center" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="edit-title"
        className="max-h-[92dvh] w-full overflow-y-auto rounded-t-2xl bg-surface p-4 pb-[calc(1rem+env(safe-area-inset-bottom))] md:max-w-lg md:rounded-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-3 flex items-center justify-between">
          <h2 id="edit-title" className="text-lg font-semibold">Edit transaction</h2>
          <button type="button" className={iconButton} aria-label="Close" onClick={onClose}>
            <X size={20} aria-hidden />
          </button>
        </div>
        <TransactionForm
          key={transaction.id}
          initial={transaction}
          categories={categories}
          onSubmit={onSubmit}
          onDelete={onDelete}
        />
      </div>
    </div>
  )
}
