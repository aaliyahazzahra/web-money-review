import { Pencil, Plus, Trash2 } from 'lucide-react'
import { type FormEvent, useState } from 'react'
import { useCategories, useCategoryMutations } from '../hooks/useCategories'
import { getCategoryIcon } from '../lib/icons'
import { DuplicateCategoryError } from '../services/errors'
import type { Category, TransactionType } from '../types'
import { ConfirmDialog } from './ConfirmDialog'
import { IconPicker } from './IconPicker'
import { QueryState } from './QueryState'
import { useToast } from './Toast'
import { fieldError, iconButton, input, label, primaryButton, secondaryButton } from './ui'

type Draft = { id?: number; type: TransactionType; name: string; icon: string }

const SECTIONS: { type: TransactionType; title: string }[] = [
  { type: 'expense', title: 'Expense categories' },
  { type: 'income', title: 'Income categories' },
]

function CategoryEditor({ draft, onCancel, onSaved }: { draft: Draft; onCancel(): void; onSaved(): void }) {
  const [name, setName] = useState(draft.name)
  const [icon, setIcon] = useState(draft.icon)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const { create, update } = useCategoryMutations()
  const toast = useToast()

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (saving) return
    if (!name.trim()) {
      setError('Name is required')
      return
    }
    setError(null)
    setSaving(true)
    try {
      if (draft.id === undefined) await create.mutateAsync({ name: name.trim(), type: draft.type, icon })
      else await update.mutateAsync({ id: draft.id, name: name.trim(), icon })
      toast.show('Saved')
      onSaved()
    } catch (err) {
      toast.show(err instanceof DuplicateCategoryError ? err.message : 'Failed to save, try again', 'error')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-2 space-y-3 rounded-xl border border-border bg-bg p-3" noValidate>
      <div>
        <label htmlFor="category-name" className={label}>Name</label>
        <input
          id="category-name"
          className={input}
          maxLength={50}
          value={name}
          onChange={(e) => setName(e.target.value)}
          autoFocus
        />
        {error && <p className={fieldError}>{error}</p>}
      </div>
      <IconPicker value={icon} onChange={setIcon} />
      <div className="flex justify-end gap-2">
        <button type="button" className={secondaryButton} onClick={onCancel}>Cancel</button>
        <button type="submit" className={primaryButton} disabled={saving} aria-label="Save category">Save</button>
      </div>
    </form>
  )
}

export function CategoryManager() {
  const categories = useCategories()
  const { archive } = useCategoryMutations()
  const toast = useToast()
  const [draft, setDraft] = useState<Draft | null>(null)
  const [deleting, setDeleting] = useState<Category | null>(null)

  async function confirmDelete() {
    if (!deleting) return
    try {
      await archive.mutateAsync(deleting.id)
      toast.show('Category deleted')
    } catch {
      toast.show('Failed to delete, try again', 'error')
    } finally {
      setDeleting(null)
    }
  }

  return (
    <QueryState isLoading={categories.isLoading} isError={categories.isError} onRetry={() => categories.refetch()}>
      <div className="space-y-5">
        {SECTIONS.map(({ type, title }) => {
          const items = (categories.data ?? []).filter((c) => c.type === type && !c.archived)
          const headingId = `categories-${type}`
          return (
            <section key={type} aria-labelledby={headingId}>
              <div className="mb-1 flex items-center justify-between">
                <h3 id={headingId} className="font-semibold">{title}</h3>
                <button
                  type="button"
                  className="inline-flex items-center gap-1 text-sm font-medium text-primary"
                  onClick={() => setDraft({ type, name: '', icon: 'circle-ellipsis' })}
                >
                  <Plus size={16} aria-hidden /> Add category
                </button>
              </div>
              {draft && draft.id === undefined && draft.type === type && (
                <CategoryEditor draft={draft} onCancel={() => setDraft(null)} onSaved={() => setDraft(null)} />
              )}
              <ul className="divide-y divide-border">
                {items.map((c) => {
                  const Icon = getCategoryIcon(c.icon)
                  return (
                    <li key={c.id} className="py-1.5">
                      <div className="flex items-center gap-3">
                        <span className="flex h-9 w-9 items-center justify-center rounded-lg text-white" style={{ backgroundColor: c.color }}>
                          <Icon size={18} aria-hidden />
                        </span>
                        <span className="flex-1 font-medium">{c.name}</span>
                        <button type="button" className={iconButton} aria-label={`Edit ${c.name}`} onClick={() => setDraft({ id: c.id, type, name: c.name, icon: c.icon })}>
                          <Pencil size={18} aria-hidden />
                        </button>
                        <button type="button" className={iconButton} aria-label={`Delete ${c.name}`} onClick={() => setDeleting(c)}>
                          <Trash2 size={18} aria-hidden />
                        </button>
                      </div>
                      {draft?.id === c.id && (
                        <CategoryEditor draft={draft} onCancel={() => setDraft(null)} onSaved={() => setDraft(null)} />
                      )}
                    </li>
                  )
                })}
              </ul>
            </section>
          )
        })}
      </div>
      <ConfirmDialog
        open={deleting !== null}
        title={deleting ? deleting.name : ""}
        message="Delete category? Existing transactions will keep it."
        confirmLabel="Delete"
        busy={archive.isPending}
        onConfirm={confirmDelete}
        onCancel={() => setDeleting(null)}
      />
    </QueryState>
  )
}
