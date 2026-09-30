import type { TransactionType } from '../types'

export const MAX_AMOUNT = 999_999_999_999

const MINUS = '−'

/** 25000 -> "25.000" (titik ribuan, tanpa desimal). */
function groupThousands(amount: number): string {
  return Math.trunc(amount)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, '.')
}

/** 25000 -> "Rp 25.000" */
export function formatRupiah(amount: number): string {
  return `Rp ${groupThousands(amount)}`
}

/** Expense -> "−Rp 25.000", income -> "+Rp 25.000" */
export function formatSignedRupiah(amount: number, type: TransactionType): string {
  return `${type === 'expense' ? MINUS : '+'}${formatRupiah(amount)}`
}

/** Ambil digit saja dari teks input. Kosong atau melebihi MAX_AMOUNT -> null. */
export function parseAmountInput(raw: string): number | null {
  const digits = raw.replace(/\D/g, '')
  if (digits === '') return null
  const value = Number(digits)
  return value > MAX_AMOUNT ? null : value
}

/** Nilai untuk ditampilkan di kolom input: 25000 -> "25.000", null -> "". */
export function formatAmountInput(amount: number | null): string {
  return amount === null ? '' : groupThousands(amount)
}
