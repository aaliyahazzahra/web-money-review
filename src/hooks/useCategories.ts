import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { archiveCategory, createCategory, listCategories, updateCategory } from '../services/categories'
import type { TransactionType } from '../types'
import { transactionKeys } from './useTransactions'

export const categoryKeys = { all: ['categories'] as const }

export function useCategories() {
  return useQuery({ queryKey: categoryKeys.all, queryFn: listCategories })
}

export function useCategoryMutations() {
  const client = useQueryClient()
  const refresh = async () => {
    await client.invalidateQueries({ queryKey: categoryKeys.all })
    // Nama/ikon kategori tampil di daftar transaksi lewat view.
    await client.invalidateQueries({ queryKey: transactionKeys.all })
  }
  return {
    create: useMutation({
      mutationFn: (c: { name: string; type: TransactionType; icon: string }) => createCategory(c),
      onSuccess: refresh,
    }),
    update: useMutation({
      mutationFn: ({ id, name, icon }: { id: number; name: string; icon: string }) => updateCategory(id, { name, icon }),
      onSuccess: refresh,
    }),
    archive: useMutation({
      mutationFn: (id: number) => archiveCategory(id),
      onSuccess: refresh,
    }),
  }
}
