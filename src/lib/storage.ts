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

export type AppStorage = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>

function memoryStorage(): AppStorage {
  const data = new Map<string, string>()
  return {
    getItem: (k) => data.get(k) ?? null,
    setItem: (k, v) => void data.set(k, v),
    removeItem: (k) => void data.delete(k),
  }
}

let fallback: AppStorage | null = null

/** window.localStorage, atau penyimpanan memori jika akses ke localStorage sendiri melempar error. */
export function getStorage(): AppStorage {
  try {
    const storage = window.localStorage
    if (storage) return storage
  } catch {
    // SecurityError saat site data diblokir
  }
  fallback ??= memoryStorage()
  return fallback
}
