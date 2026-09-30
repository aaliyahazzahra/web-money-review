import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { Transaction } from '../types'
import { SummaryCards } from './SummaryCards'
import { TransactionList } from './TransactionList'

const base = { note: null, categoryIcon: 'utensils', categoryColor: '#3F7D58', categoryArchived: false }
const lunch: Transaction = { ...base, id: 1, type: 'expense', amount: 25000, categoryId: 1, date: '2026-09-30', categoryName: 'Food', note: 'Lunch' }
const salary: Transaction = { ...base, id: 2, type: 'income', amount: 1000000, categoryId: 3, date: '2026-09-01', categoryName: 'Salary' }
const archived: Transaction = { ...base, id: 3, type: 'expense', amount: 7000, categoryId: 9, date: '2026-09-30', categoryName: 'Old stuff', categoryArchived: true }

describe('SummaryCards', () => {
  it('shows income, expense and a negative net with minus sign', () => {
    render(<SummaryCards income={10000} expense={15000} net={-5000} />)
    expect(screen.getByText('Income')).toBeInTheDocument()
    expect(screen.getByText('Rp 10.000')).toBeInTheDocument()
    expect(screen.getByText('Rp 15.000')).toBeInTheDocument()
    expect(screen.getByText('−Rp 5.000')).toBeInTheDocument()
  })
})

describe('TransactionList', () => {
  it('shows signed amounts, category and note', () => {
    render(<TransactionList transactions={[lunch, salary]} />)
    expect(screen.getByText('−Rp 25.000')).toBeInTheDocument()
    expect(screen.getByText('+Rp 1.000.000')).toBeInTheDocument()
    expect(screen.getByText('30 Sep 2026 · Lunch')).toBeInTheDocument()
  })

  it('keeps showing archived category names', () => {
    render(<TransactionList transactions={[archived]} />)
    expect(screen.getByText('Old stuff')).toBeInTheDocument()
  })

  it('groups by date with a header when grouped', () => {
    render(<TransactionList transactions={[lunch, archived, salary]} grouped />)
    expect(screen.getByText('30 Sep 2026')).toBeInTheDocument()
    expect(screen.getByText('1 Sep 2026')).toBeInTheDocument()
  })

  it('calls onSelect when a row is tapped', async () => {
    const onSelect = vi.fn()
    render(<TransactionList transactions={[lunch]} onSelect={onSelect} />)
    await userEvent.click(screen.getByText('Food'))
    expect(onSelect).toHaveBeenCalledWith(lunch)
  })

  it('shows an empty state', () => {
    render(<TransactionList transactions={[]} />)
    expect(screen.getByText('No transactions yet')).toBeInTheDocument()
  })
})
