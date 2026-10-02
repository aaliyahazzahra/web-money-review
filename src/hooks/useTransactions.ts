import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  createTransaction,
  deleteTransaction,
  getBalance,
  listRecentTransactions,
  listTransactions,
  type TransactionFilter,
  updateTransaction,
} from '../services/transactions'
import type { TransactionInput } from '../types'

export const transactionKeys = {
  all: ['transactions'] as const,
  list: (filter: TransactionFilter) => ['transactions', filter] as const,
  recent: ['transactions', 'recent'] as const,
  balance: ['transactions', 'balance'] as const,
}

export function useTransactions(filter: TransactionFilter) {
  return useQuery({ queryKey: transactionKeys.list(filter), queryFn: () => listTransactions(filter) })
}

export function useRecentTransactions() {
  return useQuery({ queryKey: transactionKeys.recent, queryFn: () => listRecentTransactions(5) })
}

/** Saldo keseluruhan (semua transaksi, lintas bulan) untuk kartu Balance di Home. */
export function useAllTimeBalance() {
  return useQuery({ queryKey: transactionKeys.balance, queryFn: getBalance })
}

export function useSaveTransaction() {
  const client = useQueryClient()
  return useMutation({
    mutationFn: ({ id, input }: { id?: number; input: TransactionInput }) =>
      id === undefined ? createTransaction(input) : updateTransaction(id, input),
    onSuccess: () => client.invalidateQueries({ queryKey: transactionKeys.all }),
  })
}

export function useDeleteTransaction() {
  const client = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => deleteTransaction(id),
    onSuccess: () => client.invalidateQueries({ queryKey: transactionKeys.all }),
  })
}
