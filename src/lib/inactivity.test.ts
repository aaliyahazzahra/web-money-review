import { INACTIVITY_LIMIT_MS, isInactive, readLastActivity, recordActivity } from './inactivity'

function memoryStorage(initial: Record<string, string> = {}) {
  const data = { ...initial }
  return {
    getItem: vi.fn((k: string) => data[k] ?? null),
    setItem: vi.fn((k: string, v: string) => { data[k] = v }),
  }
}
const throwing = {
  getItem: () => { throw new Error('blocked') },
  setItem: () => { throw new Error('blocked') },
}
const t = 1_800_000_000_000

describe('isInactive', () => {
  it('uses a 7 day limit and treats missing record as active', () => {
    expect(INACTIVITY_LIMIT_MS).toBe(604_800_000)
    expect(isInactive(null, t)).toBe(false)
    expect(isInactive(t - 604_800_000 + 1, t)).toBe(false)
    expect(isInactive(t - 604_800_001, t)).toBe(true)
  })
})

describe('readLastActivity', () => {
  it('reads the stored timestamp', () => {
    expect(readLastActivity(memoryStorage({ 'mr:lastActivity': String(t) }))).toBe(t)
  })
  it('returns null for corrupt values or blocked storage', () => {
    expect(readLastActivity(memoryStorage({ 'mr:lastActivity': 'abc' }))).toBeNull()
    expect(readLastActivity(throwing)).toBeNull()
  })
})

describe('recordActivity', () => {
  it('writes at most once per minute', () => {
    const s = memoryStorage()
    recordActivity(s, t)
    recordActivity(s, t + 30_000)
    expect(s.setItem).toHaveBeenCalledTimes(1)
    recordActivity(s, t + 61_000)
    expect(s.setItem).toHaveBeenCalledTimes(2)
    expect(s.setItem).toHaveBeenLastCalledWith('mr:lastActivity', String(t + 61_000))
  })
  it('swallows storage errors', () => {
    expect(() => recordActivity(throwing, t)).not.toThrow()
  })
})
