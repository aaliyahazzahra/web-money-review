import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'
import type { Category } from '../types'
import { AmountInput } from './AmountInput'
import { CategoryPicker } from './CategoryPicker'
import { TransactionForm } from './TransactionForm'

const categories: Category[] = [
  { id: 1, name: 'Food', type: 'expense', icon: 'utensils', color: '#3F7D58', archived: false },
  { id: 2, name: 'Old stuff', type: 'expense', icon: 'bus', color: '#2F6B9A', archived: true },
  { id: 3, name: 'Salary', type: 'income', icon: 'wallet', color: '#C58B1A', archived: false },
]

function ControlledAmount({ onChange }: { onChange(v: number | null): void }) {
  const [value, setValue] = useState<number | null>(null)
  return <AmountInput value={value} onChange={(v) => { setValue(v); onChange(v) }} />
}

describe('AmountInput', () => {
  it('adds thousand separators while typing', async () => {
    const onChange = vi.fn()
    render(<ControlledAmount onChange={onChange} />)
    const field = screen.getByLabelText('Amount')
    await userEvent.type(field, '25000')
    expect(onChange).toHaveBeenLastCalledWith(25000)
    expect(field).toHaveValue('25.000')
  })

  it('ignores input beyond the maximum', async () => {
    const onChange = vi.fn()
    render(<ControlledAmount onChange={onChange} />)
    const field = screen.getByLabelText('Amount')
    await userEvent.type(field, '9999999999999')
    expect(field).toHaveValue('999.999.999.999')
  })
})

describe('CategoryPicker', () => {
  it('shows only active categories of the chosen type', async () => {
    const onChange = vi.fn()
    render(<CategoryPicker categories={categories} type="expense" value={null} onChange={onChange} />)
    expect(screen.getByRole('button', { name: 'Food' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Old stuff' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Salary' })).not.toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Food' }))
    expect(onChange).toHaveBeenCalledWith(1)
  })
})

describe('TransactionForm', () => {
  it('validates required fields without submitting', async () => {
    const onSubmit = vi.fn()
    render(<TransactionForm categories={categories} onSubmit={onSubmit} />)
    await userEvent.click(screen.getByRole('button', { name: 'Save' }))
    expect(screen.getByText('Amount is required')).toBeInTheDocument()
    expect(screen.getByText('Category is required')).toBeInTheDocument()
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('treats zero as missing amount', async () => {
    const onSubmit = vi.fn()
    render(<TransactionForm categories={categories} onSubmit={onSubmit} />)
    await userEvent.type(screen.getByLabelText('Amount'), '0')
    await userEvent.click(screen.getByRole('button', { name: 'Food' }))
    await userEvent.click(screen.getByRole('button', { name: 'Save' }))
    expect(screen.getByText('Amount is required')).toBeInTheDocument()
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('submits once even when Save is clicked twice', async () => {
    const onSubmit = vi.fn(() => new Promise<void>(() => {}))
    render(<TransactionForm categories={categories} onSubmit={onSubmit} />)
    await userEvent.type(screen.getByLabelText('Amount'), '25000')
    await userEvent.click(screen.getByRole('button', { name: 'Food' }))
    const save = screen.getByRole('button', { name: 'Save' })
    await userEvent.click(save)
    await userEvent.click(save)
    expect(onSubmit).toHaveBeenCalledTimes(1)
    expect(onSubmit).toHaveBeenCalledWith(expect.objectContaining({ type: 'expense', amount: 25000, categoryId: 1, note: null }))
    expect(save).toBeDisabled()
  })

  it('keeps values when saving fails', async () => {
    const onSubmit = vi.fn().mockRejectedValue(new Error('offline'))
    render(<TransactionForm categories={categories} onSubmit={onSubmit} />)
    await userEvent.type(screen.getByLabelText('Amount'), '25000')
    await userEvent.click(screen.getByRole('button', { name: 'Food' }))
    await userEvent.click(screen.getByRole('button', { name: 'Save' }))
    expect(screen.getByLabelText('Amount')).toHaveValue('25.000')
    expect(screen.getByRole('button', { name: 'Save' })).toBeEnabled()
  })

  it('resets amount/category/note after success but keeps type', async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined)
    render(<TransactionForm categories={categories} onSubmit={onSubmit} />)
    await userEvent.click(screen.getByRole('radio', { name: 'Income' }))
    await userEvent.type(screen.getByLabelText('Amount'), '1000000')
    await userEvent.click(screen.getByRole('button', { name: 'Salary' }))
    await userEvent.type(screen.getByLabelText('Note (optional)'), 'September')
    await userEvent.click(screen.getByRole('button', { name: 'Save' }))
    expect(onSubmit).toHaveBeenCalledWith(expect.objectContaining({ type: 'income', amount: 1000000, categoryId: 3, note: 'September' }))
    expect(screen.getByLabelText('Amount')).toHaveValue('')
    expect(screen.getByLabelText('Note (optional)')).toHaveValue('')
    expect(screen.getByRole('radio', { name: 'Income' })).toBeChecked()
    expect(screen.getByRole('button', { name: 'Salary' })).toHaveAttribute('aria-pressed', 'false')
  })

  it('clears the selected category when switching type', async () => {
    render(<TransactionForm categories={categories} onSubmit={vi.fn()} />)
    await userEvent.click(screen.getByRole('button', { name: 'Food' }))
    await userEvent.click(screen.getByRole('radio', { name: 'Income' }))
    await userEvent.click(screen.getByRole('radio', { name: 'Expense' }))
    expect(screen.getByRole('button', { name: 'Food' })).toHaveAttribute('aria-pressed', 'false')
  })

  it('shows Delete only in edit mode', () => {
    const initial = {
      id: 5, type: 'expense' as const, amount: 5000, categoryId: 1, date: '2026-09-30', note: null,
      categoryName: 'Food', categoryIcon: 'utensils', categoryColor: '#3F7D58', categoryArchived: false,
    }
    const { unmount } = render(<TransactionForm categories={categories} onSubmit={vi.fn()} />)
    expect(screen.queryByRole('button', { name: 'Delete' })).not.toBeInTheDocument()
    unmount()
    render(<TransactionForm categories={categories} onSubmit={vi.fn()} initial={initial} onDelete={vi.fn()} />)
    expect(screen.getByRole('button', { name: 'Delete' })).toBeInTheDocument()
    expect(screen.getByLabelText('Amount')).toHaveValue('5.000')
  })
})
