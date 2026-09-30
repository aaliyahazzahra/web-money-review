import { type KeyValueStorage, safeGet, safeSet } from './storage'

export type ThemePref = 'system' | 'light' | 'dark'
export type Theme = 'light' | 'dark'

const KEY = 'mr:theme'
const PREFS: ThemePref[] = ['system', 'light', 'dark']

export function loadThemePref(storage: KeyValueStorage): ThemePref {
  const value = safeGet(storage, KEY)
  return PREFS.includes(value as ThemePref) ? (value as ThemePref) : 'system'
}

export function saveThemePref(storage: KeyValueStorage, pref: ThemePref): void {
  safeSet(storage, KEY, pref)
}

export function resolveTheme(pref: ThemePref, prefersDark: boolean): Theme {
  if (pref === 'system') return prefersDark ? 'dark' : 'light'
  return pref
}

export function applyTheme(theme: Theme): void {
  document.documentElement.dataset.theme = theme
}
