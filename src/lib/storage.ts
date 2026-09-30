export type KeyValueStorage = Pick<Storage, 'getItem' | 'setItem'>

/** localStorage bisa tidak tersedia (private mode, diblokir); akses selalu lewat try/catch. */
export function safeGet(storage: KeyValueStorage, key: string): string | null {
  try {
    return storage.getItem(key)
  } catch {
    return null
  }
}

export function safeSet(storage: KeyValueStorage, key: string, value: string): void {
  try {
    storage.setItem(key, value)
  } catch {
    // Diabaikan: preferensi hanya kenyamanan, app tetap berjalan tanpa storage.
  }
}
