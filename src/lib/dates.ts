// Semua tanggal berupa string 'YYYY-MM-DD' dan bulan 'YYYY-MM'.

const pad = (n: number) => String(n).padStart(2, '0')

function parseMonthKey(monthKey: string): { year: number; month: number } {
  const [year, month] = monthKey.split('-').map(Number)
  return { year, month }
}

/** Tanggal lokal perangkat (bukan UTC). */
export function todayISO(now: Date = new Date()): string {
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`
}

export function currentMonthKey(now: Date = new Date()): string {
  return todayISO(now).slice(0, 7)
}

export function monthRange(monthKey: string): { from: string; to: string } {
  const { year, month } = parseMonthKey(monthKey)
  const lastDay = new Date(year, month, 0).getDate()
  return { from: `${monthKey}-01`, to: `${monthKey}-${pad(lastDay)}` }
}

export function shiftMonth(monthKey: string, delta: number): string {
  const { year, month } = parseMonthKey(monthKey)
  const index = year * 12 + (month - 1) + delta
  return `${Math.floor(index / 12)}-${pad((index % 12) + 1)}`
}

/** n bulan yang berakhir di endMonthKey, urut naik. */
export function lastNMonths(endMonthKey: string, n: number): string[] {
  return Array.from({ length: n }, (_, i) => shiftMonth(endMonthKey, i - (n - 1)))
}

// Singkatan tetap: Intl en-GB memakai "Sept", spec menetapkan "Sep".
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

/** '2026-09-30' -> '30 Sep 2026' */
export function formatDisplayDate(iso: string): string {
  const [year, month, day] = iso.split('-').map(Number)
  return `${day} ${MONTHS[month - 1]} ${year}`
}

/** '2026-09' -> 'Sep 2026' */
export function formatMonthLabel(monthKey: string): string {
  const { year, month } = parseMonthKey(monthKey)
  return `${MONTHS[month - 1]} ${year}`
}
