import type { Transaction } from '../types'

export interface MonthlySummary {
  income: number
  expense: number
  net: number
}

export interface CategoryTotal {
  categoryId: number
  name: string
  color: string
  total: number
  percent: number
}

export interface MonthPoint {
  month: string
  income: number
  expense: number
}

export interface DateGroup {
  date: string
  items: Transaction[]
}

export function monthlySummary(txs: Transaction[]): MonthlySummary {
  let income = 0
  let expense = 0
  for (const t of txs) {
    if (t.type === 'income') income += t.amount
    else expense += t.amount
  }
  return { income, expense, net: income - expense }
}

/** Total pengeluaran per kategori (termasuk kategori terarsip), urut menurun. */
export function expenseByCategory(txs: Transaction[]): CategoryTotal[] {
  const byId = new Map<number, CategoryTotal>()
  let grand = 0
  for (const t of txs) {
    if (t.type !== 'expense') continue
    grand += t.amount
    const row = byId.get(t.categoryId)
    if (row) row.total += t.amount
    else byId.set(t.categoryId, { categoryId: t.categoryId, name: t.categoryName, color: t.categoryColor, total: t.amount, percent: 0 })
  }
  const rows = [...byId.values()]
  for (const row of rows) row.percent = Math.round((row.total / grand) * 1000) / 10
  return rows.sort((a, b) => b.total - a.total)
}

export function monthlySeries(txs: Transaction[], months: string[]): MonthPoint[] {
  const points = new Map(months.map((month) => [month, { month, income: 0, expense: 0 }]))
  for (const t of txs) {
    const point = points.get(t.date.slice(0, 7))
    if (point) point[t.type] += t.amount
  }
  return [...points.values()]
}

/** Kelompok per tanggal, tanggal terbaru dulu; urutan item dalam grup dipertahankan. */
export function groupByDate(txs: Transaction[]): DateGroup[] {
  const groups = new Map<string, Transaction[]>()
  for (const t of txs) {
    const items = groups.get(t.date)
    if (items) items.push(t)
    else groups.set(t.date, [t])
  }
  return [...groups.entries()]
    .sort(([a], [b]) => (a < b ? 1 : a > b ? -1 : 0))
    .map(([date, items]) => ({ date, items }))
}
