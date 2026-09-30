import { type KeyValueStorage, safeGet, safeSet } from './storage'

export const INACTIVITY_LIMIT_MS = 7 * 24 * 60 * 60 * 1000
const KEY = 'mr:lastActivity'
const WRITE_INTERVAL_MS = 60_000

export function readLastActivity(storage: KeyValueStorage): number | null {
  const raw = safeGet(storage, KEY)
  if (raw === null) return null
  const value = Number(raw)
  return Number.isFinite(value) && raw.trim() !== '' ? value : null
}

/** Catat aktivitas; paling sering sekali per menit. */
export function recordActivity(storage: KeyValueStorage, now: number): void {
  const last = readLastActivity(storage)
  if (last !== null && now - last < WRITE_INTERVAL_MS) return
  safeSet(storage, KEY, String(now))
}

/** Tanpa catatan dianggap aktif (mis. login pertama atau storage diblokir). */
export function isInactive(last: number | null, now: number): boolean {
  return last !== null && now - last > INACTIVITY_LIMIT_MS
}

/** Tandai aktif sekarang tanpa throttle (dipakai tepat setelah login). */
export function markActive(storage: KeyValueStorage, now: number): void {
  safeSet(storage, KEY, String(now))
}

export function clearActivity(storage: Pick<Storage, 'removeItem'>): void {
  try {
    storage.removeItem(KEY)
  } catch {
    // diabaikan
  }
}
