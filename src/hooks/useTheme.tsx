import { createContext, type ReactNode, useContext, useEffect, useState } from 'react'
import { applyTheme, loadThemePref, resolveTheme, saveThemePref, type ThemePref } from '../lib/theme'

interface ThemeApi {
  pref: ThemePref
  setPref(pref: ThemePref): void
}

const ThemeContext = createContext<ThemeApi | null>(null)
const DARK_QUERY = '(prefers-color-scheme: dark)'

function prefersDark(): boolean {
  return typeof window.matchMedia === 'function' && window.matchMedia(DARK_QUERY).matches
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [pref, setPrefState] = useState<ThemePref>(() => loadThemePref(localStorage))

  useEffect(() => {
    applyTheme(resolveTheme(pref, prefersDark()))
    if (pref !== 'system' || typeof window.matchMedia !== 'function') return
    const media = window.matchMedia(DARK_QUERY)
    const onChange = () => applyTheme(resolveTheme('system', media.matches))
    media.addEventListener('change', onChange)
    return () => media.removeEventListener('change', onChange)
  }, [pref])

  const setPref = (next: ThemePref) => {
    saveThemePref(localStorage, next)
    setPrefState(next)
  }

  return <ThemeContext.Provider value={{ pref, setPref }}>{children}</ThemeContext.Provider>
}

export function useTheme(): ThemeApi {
  const api = useContext(ThemeContext)
  if (!api) throw new Error('useTheme must be used inside ThemeProvider')
  return api
}
