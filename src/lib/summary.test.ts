import type { Transaction } from '../types'
import { lastNMonths } from './dates'
import { OTHER_COLOR, collapseCategories, expenseByCategory, groupByDate, monthlySeries, monthlySummary } from './summary'

function tx(p: Partial<Transaction> & Pick<Transaction, 'id' | 'type' | 'amount' | 'date' | 'categoryId'>): Transaction {
  return { note: null, categoryName: `Cat ${p.categoryId}`, categoryIcon: 'bus', categoryColor: '#3F7D58', categoryArchived: false, ...p }
}

const food = tx({ id: 1, type: 'expense', amount: 30000, date: '2026-09-30', categoryId: 1, categoryName: 'Food' })
const oldCat = tx({ id: 2, type: 'expense', amount: 10000, date: '2026-09-02', categoryId: 2, categoryName: 'Old', categoryArchived: true, categoryColor: '#2F6B9A' })
const salary = tx({ id: 3, type: 'income', amount: 25000, date: '2026-09-01', categoryId: 3, categoryName: 'Salary' })
const august = tx({ id: 4, type: 'expense', amount: 5000, date: '2026-08-15', categoryId: 1, categoryName: 'Food' })
const september = [food, oldCat, salary]

describe('monthlySummary', () => {
  it('sums income, expense and net (can be negative)', () => {
    expect(monthlySummary(september)).toEqual({ income: 25000, expense: 40000, net: -15000 })
    expect(monthlySummary([])).toEqual({ income: 0, expense: 0, net: 0 })
  })
})

describe('expenseByCategory', () => {
  it('groups expenses incl. archived categories, sorted desc with percent', () => {
    expect(expenseByCategory(september)).toEqual([
      { categoryId: 1, name: 'Food', color: '#3F7D58', total: 30000, percent: 75 },
      { categoryId: 2, name: 'Old', color: '#2F6B9A', total: 10000, percent: 25 },
    ])
  })
  it('rounds percent to one decimal and handles empty', () => {
    const thirds = [1, 2, 3].map((c) => tx({ id: c, type: 'expense', amount: 1, date: '2026-09-01', categoryId: c }))
    expect(expenseByCategory(thirds).map((r) => r.percent)).toEqual([33.3, 33.3, 33.3])
    expect(expenseByCategory([salary])).toEqual([])
  })
})

describe('monthlySeries', () => {
  it('fills months without transactions with zeros', () => {
    expect(monthlySeries([...september, august], lastNMonths('2026-10', 3))).toEqual([
      { month: '2026-08', income: 0, expense: 5000 },
      { month: '2026-09', income: 25000, expense: 40000 },
      { month: '2026-10', income: 0, expense: 0 },
    ])
  })
})

describe('groupByDate', () => {
  it('groups by date descending, keeping item order', () => {
    const sameDay = tx({ id: 9, type: 'income', amount: 1, date: '2026-09-30', categoryId: 3 })
    const groups = groupByDate([salary, food, sameDay, oldCat])
    expect(groups.map((g) => g.date)).toEqual(['2026-09-30', '2026-09-02', '2026-09-01'])
    expect(groups[0].items.map((t) => t.id)).toEqual([1, 9])
  })
})

describe('collapseCategories', () => {
  it('keeps the top N and folds the rest into Other', () => {
    const rows = [5, 4, 3, 2, 1].map((t, i) => ({ categoryId: i + 1, name: `C${i + 1}`, color: '#000', total: t * 10, percent: t * 10 / 1.5 }))
    const collapsed = collapseCategories(rows, 3)
    expect(collapsed.map((r) => r.name)).toEqual(['C1', 'C2', 'Other categories'])
    expect(collapsed[2]).toEqual({ categoryId: -1, name: 'Other categories', color: OTHER_COLOR, total: 60, percent: 40 })
    expect(collapseCategories(rows.slice(0, 3), 3).map((r) => r.name)).toEqual(['C1', 'C2', 'C3'])
  })
})
