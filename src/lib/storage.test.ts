import { getStorage } from './storage'

describe('getStorage', () => {
  it('falls back to an in-memory store when window.localStorage throws on access', () => {
    const original = Object.getOwnPropertyDescriptor(window, 'localStorage')!
    Object.defineProperty(window, 'localStorage', { configurable: true, get: () => { throw new DOMException('blocked', 'SecurityError') } })
    try {
      const s = getStorage()
      s.setItem('k', 'v')
      expect(s.getItem('k')).toBe('v')
      expect(() => s.removeItem('k')).not.toThrow()
    } finally {
      Object.defineProperty(window, 'localStorage', original)
    }
  })

  it('returns window.localStorage when available', () => {
    expect(getStorage()).toBe(window.localStorage)
  })
})
