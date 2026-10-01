import type { Transaction, TransactionInput, TransactionType } from '../types'
import { throwIfError } from './errors'
import { supabase } from './supabase'

interface TransactionRow {
  id: number
  type: TransactionType
  amount: number
  category_id: number
  transaction_date: string
  note: string | null
  category_name: string
  category_icon: string
  category_color: string
  category_archived: boolean
}

export interface TransactionFilter {
  from: string
  to: string
  categoryId?: number
}

const COLUMNS =
  'id,type,amount,category_id,transaction_date,note,category_name,category_icon,category_color,category_archived'

function toTransaction(r: TransactionRow): Transaction {
  return {
    id: r.id,
    type: r.type,
    amount: Number(r.amount),
    categoryId: r.category_id,
    date: r.transaction_date,
    note: r.note,
    categoryName: r.category_name,
    categoryIcon: r.category_icon,
    categoryColor: r.category_color,
    categoryArchived: r.category_archived,
  }
}

function toRow(i: TransactionInput) {
  return { type: i.type, amount: i.amount, category_id: i.categoryId, transaction_date: i.date, note: i.note }
}

export async function listTransactions(f: TransactionFilter): Promise<Transaction[]> {
  let query = supabase
    .from('vw_transactions')
    .select(COLUMNS)
    .gte('transaction_date', f.from)
    .lte('transaction_date', f.to)
  if (f.categoryId !== undefined) query = query.eq('category_id', f.categoryId)
  const { data, error } = await query
    .order('transaction_date', { ascending: false })
    .order('id', { ascending: false })
  throwIfError(error)
  return ((data ?? []) as TransactionRow[]).map(toTransaction)
}

/** Jumlah saldo keseluruhan, lintas bulan — hanya ambil kolom yang dipakai untuk penjumlahan. */
export async function listAllAmounts(): Promise<{ type: TransactionType; amount: number }[]> {
  const { data, error } = await supabase.from('vw_transactions').select('type,amount')
  throwIfError(error)
  return ((data ?? []) as { type: TransactionType; amount: number }[]).map((r) => ({ type: r.type, amount: Number(r.amount) }))
}

export async function listRecentTransactions(limit = 5): Promise<Transaction[]> {
  const { data, error } = await supabase
    .from('vw_transactions')
    .select(COLUMNS)
    .order('transaction_date', { ascending: false })
    .order('id', { ascending: false })
    .limit(limit)
  throwIfError(error)
  return ((data ?? []) as TransactionRow[]).map(toTransaction)
}

export async function createTransaction(i: TransactionInput): Promise<void> {
  const { error } = await supabase.from('tb_transactions').insert(toRow(i))
  throwIfError(error)
}

export async function updateTransaction(id: number, i: TransactionInput): Promise<void> {
  const { error } = await supabase.from('tb_transactions').update(toRow(i)).eq('id', id)
  throwIfError(error)
}

/** Soft delete: database mengganti nilainya dengan now() dan mengisi deleted_by. */
export async function deleteTransaction(id: number): Promise<void> {
  const { error } = await supabase
    .from('tb_transactions')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', id)
  throwIfError(error)
}
