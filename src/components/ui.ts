// Kelas Tailwind bersama supaya tampilan tombol/kolom konsisten di semua halaman.

export const card = 'rounded-2xl bg-surface p-4'

export const label = 'mb-1 block text-sm font-medium text-muted'

export const input =
  'w-full rounded-xl border border-border bg-bg px-3 py-2.5 text-base text-text outline-none placeholder:text-muted/70 focus:border-primary focus:ring-2 focus:ring-primary/25'

export const fieldError = 'mt-1 text-sm text-expense'

const buttonBase =
  'inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-base font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-60'

export const primaryButton = `${buttonBase} bg-primary text-on-primary hover:bg-primary-pressed active:bg-primary-pressed`

export const secondaryButton = `${buttonBase} border border-border bg-bg text-text hover:bg-surface`

export const dangerButton = `${buttonBase} border border-expense text-expense hover:bg-expense/10`

export const iconButton =
  'inline-flex h-10 w-10 items-center justify-center rounded-xl text-text hover:bg-surface disabled:opacity-40'
