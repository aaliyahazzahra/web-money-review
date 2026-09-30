import { CATEGORY_COLORS } from '../lib/icons'
import type { Category, TransactionType } from '../types'
import { DuplicateCategoryError, throwIfError } from './errors'
import { supabase } from './supabase'

interface CategoryRow {
  id: number
  name: string
  type: TransactionType
  icon: string
  color: string
  deleted_at: string | null
}

const UNIQUE_VIOLATION = '23505'

function throwCategoryError(error: { code?: string; message: string } | null): void {
  if (error?.code === UNIQUE_VIOLATION) throw new DuplicateCategoryError()
  throwIfError(error)
}

/** Semua kategori, termasuk yang diarsipkan (dibutuhkan untuk label transaksi lama). */
export async function listCategories(): Promise<Category[]> {
  const { data, error } = await supabase
    .from('tb_categories')
    .select('id,name,type,icon,color,deleted_at')
    .order('id')
  throwIfError(error)
  return ((data ?? []) as CategoryRow[]).map((r) => ({
    id: r.id,
    name: r.name,
    type: r.type,
    icon: r.icon,
    color: r.color,
    archived: r.deleted_at !== null,
  }))
}

export async function createCategory(c: { name: string; type: TransactionType; icon: string }): Promise<void> {
  const { count, error: countError } = await supabase
    .from('tb_categories')
    .select('id', { count: 'exact', head: true })
  throwIfError(countError)
  const color = CATEGORY_COLORS[(count ?? 0) % CATEGORY_COLORS.length]
  const { error } = await supabase
    .from('tb_categories')
    .insert({ name: c.name.trim(), type: c.type, icon: c.icon, color })
  throwCategoryError(error)
}

export async function updateCategory(id: number, c: { name: string; icon: string }): Promise<void> {
  const { error } = await supabase
    .from('tb_categories')
    .update({ name: c.name.trim(), icon: c.icon })
    .eq('id', id)
  throwCategoryError(error)
}

export async function archiveCategory(id: number): Promise<void> {
  const { error } = await supabase
    .from('tb_categories')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', id)
  throwIfError(error)
}
