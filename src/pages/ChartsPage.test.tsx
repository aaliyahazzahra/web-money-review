import { render, screen, within } from '@testing-library/react'
import type { Transaction } from '../types'

vi.mock('react-chartjs-2', () => ({
  Doughnut: ({ data }: { data: unknown }) => <pre data-testid="doughnut">{JSON.stringify(data)}</pre>,
  Bar: ({ data }: { data: unknown }) => <pre data-testid="bar">{JSON.stringify(data)}</pre>,
}))

const useTransactions = vi.fn()
vi.mock('../hooks/useTransactions', () => ({ useTransactions: (f: unknown) => useTransactions(f) }))

const { ChartsPage } = await import('./ChartsPage')
const { currentMonthKey, monthRange, shiftMonth } = await import('../lib/dates')

const month = currentMonthKey()
const base = { note: null, categoryIcon: 'utensils', categoryArchived: false }
const txs: Transaction[] = [
  { ...base, id: 1, type: 'expense', amount: 75000, categoryId: 1, date: `${month}-02`, categoryName: 'Food', categoryColor: '#2a78d6' },
  { ...base, id: 2, type: 'expense', amount: 25000, categoryId: 2, date: `${month}-03`, categoryName: 'Transport', categoryColor: '#eb6834' },
  { ...base, id: 3, type: 'income', amount: 500000, categoryId: 3, date: `${month}-01`, categoryName: 'Salary', categoryColor: '#1baf7a' },
]

describe('ChartsPage', () => {
  it('queries six months ending at the selected month', () => {
    useTransactions.mockReturnValue({ data: txs, isLoading: false, isError: false })
    render(<ChartsPage />)
    expect(useTransactions).toHaveBeenCalledWith({ from: monthRange(shiftMonth(month, -5)).from, to: monthRange(month).to })
  })

  it('shows the expense legend with amounts and percentages', () => {
    useTransactions.mockReturnValue({ data: txs, isLoading: false, isError: false })
    render(<ChartsPage />)
    const legend = screen.getByRole('list', { name: 'Expense by category' })
    expect(within(legend).getByText('Food')).toBeInTheDocument()
    expect(within(legend).getByText('Rp 75.000')).toBeInTheDocument()
    expect(within(legend).getByText('75%')).toBeInTheDocument()
    expect(within(legend).getByText('25%')).toBeInTheDocument()
  })

  it('shows an empty state for a month without expenses', () => {
    useTransactions.mockReturnValue({ data: [txs[2]], isLoading: false, isError: false })
    render(<ChartsPage />)
    expect(screen.getByText('No expenses this month')).toBeInTheDocument()
  })

  it('draws six monthly bars for income and expense', () => {
    useTransactions.mockReturnValue({ data: txs, isLoading: false, isError: false })
    render(<ChartsPage />)
    const data = JSON.parse(screen.getByTestId('bar').textContent!)
    expect(data.labels).toHaveLength(6)
    expect(data.datasets.map((d: { label: string }) => d.label)).toEqual(['Income', 'Expense'])
    expect(data.datasets[0].data[5]).toBe(500000)
    expect(data.datasets[1].data[5]).toBe(100000)
  })
})
