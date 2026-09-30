import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MonthPicker } from '../components/MonthPicker'
import { ToastProvider } from '../components/Toast'
import type { Category, Transaction } from '../types'

const lunch: Transaction = {
  id: 41, type: 'expense', amount: 25000, categoryId: 1, date: '2026-09-30', note: 'Lunch',
  categoryName: 'Food', categoryIcon: 'utensils', categoryColor: '#3F7D58', categoryArchived: false,
}
const categories: Category[] = [
  { id: 1, name: 'Food', type: 'expense', icon: 'utensils', color: '#3F7D58', archived: false },
  { id: 2, name: 'Old stuff', type: 'expense', icon: 'bus', color: '#2F6B9A', archived: true },
]
const deleteMutate = vi.fn()
const useTransactions = vi.fn()

vi.mock('../hooks/useTransactions', () => ({
  useTransactions: (f: unknown) => useTransactions(f),
  useSaveTransaction: () => ({ mutateAsync: vi.fn() }),
  useDeleteTransaction: () => ({ mutateAsync: deleteMutate, isPending: false }),
}))
vi.mock('../hooks/useCategories', () => ({
  useCategories: () => ({ data: categories, isLoading: false, isError: false }),
}))

const { TransactionsPage } = await import('./TransactionsPage')

beforeEach(() => {
  deleteMutate.mockReset().mockResolvedValue(undefined)
  useTransactions.mockReset().mockReturnValue({ data: [lunch], isLoading: false, isError: false })
})

describe('MonthPicker', () => {
  it('moves across the year boundary', async () => {
    const onChange = vi.fn()
    render(<MonthPicker value="2026-01" onChange={onChange} />)
    expect(screen.getByText('Jan 2026')).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Previous month' }))
    expect(onChange).toHaveBeenCalledWith('2025-12')
  })
})

describe('TransactionsPage', () => {
  function renderPage() {
    return render(<ToastProvider><TransactionsPage /></ToastProvider>)
  }

  it('lists archived categories in the filter with a suffix', () => {
    renderPage()
    expect(screen.getByRole('option', { name: 'Old stuff (archived)' })).toBeInTheDocument()
  })

  it('filters by category', async () => {
    renderPage()
    await userEvent.selectOptions(screen.getByLabelText('Category filter'), '1')
    expect(useTransactions).toHaveBeenLastCalledWith(expect.objectContaining({ categoryId: 1 }))
  })

  it('asks for confirmation before deleting', async () => {
    renderPage()
    await userEvent.click(screen.getByRole('button', { name: /Food/ }))
    await userEvent.click(screen.getByRole('button', { name: 'Delete' }))
    expect(screen.getByRole('dialog', { name: 'Delete transaction?' })).toBeInTheDocument()

    await userEvent.click(screen.getByRole('button', { name: 'Cancel' }))
    expect(deleteMutate).not.toHaveBeenCalled()

    await userEvent.click(screen.getByRole('button', { name: 'Delete' }))
    const dialog = screen.getByRole('dialog', { name: 'Delete transaction?' })
    await userEvent.click(dialog.querySelector('button:last-child')!)
    expect(deleteMutate).toHaveBeenCalledWith(41)
    expect(await screen.findByText('Transaction deleted')).toBeInTheDocument()
  })
})
