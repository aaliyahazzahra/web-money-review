import { applyTheme, loadThemePref, resolveTheme, saveThemePref } from './theme'

const throwing = {
  getItem: () => { throw new Error('blocked') },
  setItem: () => { throw new Error('blocked') },
}

describe('theme preference', () => {
  it('defaults to system for missing, invalid or blocked storage', () => {
    expect(loadThemePref({ getItem: () => null, setItem: () => {} })).toBe('system')
    expect(loadThemePref({ getItem: () => 'purple', setItem: () => {} })).toBe('system')
    expect(loadThemePref(throwing)).toBe('system')
  })
  it('round-trips a saved preference', () => {
    const data: Record<string, string> = {}
    const s = { getItem: (k: string) => data[k] ?? null, setItem: (k: string, v: string) => { data[k] = v } }
    saveThemePref(s, 'dark')
    expect(data['mr:theme']).toBe('dark')
    expect(loadThemePref(s)).toBe('dark')
    expect(() => saveThemePref(throwing, 'light')).not.toThrow()
  })
  it('resolves system against the OS setting', () => {
    expect(resolveTheme('system', true)).toBe('dark')
    expect(resolveTheme('system', false)).toBe('light')
    expect(resolveTheme('light', true)).toBe('light')
    expect(resolveTheme('dark', false)).toBe('dark')
  })
  it('applies the theme to the html element', () => {
    applyTheme('dark')
    expect(document.documentElement.dataset.theme).toBe('dark')
  })
})
