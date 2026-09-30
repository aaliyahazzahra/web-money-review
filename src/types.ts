export type TransactionType = 'expense' | 'income'

export interface Category {
  id: number
  name: string
  type: TransactionType
  icon: string
  color: string
  archived: boolean
}

export interface Transaction {
  id: number
  type: TransactionType
  amount: number
  categoryId: number
  /** YYYY-MM-DD */
  date: string
  note: string | null
  categoryName: string
  categoryIcon: string
  categoryColor: string
  categoryArchived: boolean
}

export interface TransactionInput {
  type: TransactionType
  amount: number
  categoryId: number
  /** YYYY-MM-DD */
  date: string
  note: string | null
}
