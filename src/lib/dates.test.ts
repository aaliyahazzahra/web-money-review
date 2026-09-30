import { currentMonthKey, formatDisplayDate, formatMonthLabel, lastNMonths, monthRange, shiftMonth, todayISO } from './dates'

describe('todayISO', () => {
  it('uses the local calendar date, not UTC', () => {
    expect(todayISO(new Date(2026, 9, 1, 0, 30))).toBe('2026-10-01')
    expect(todayISO(new Date(2026, 8, 30, 23, 59))).toBe('2026-09-30')
  })
})

describe('currentMonthKey', () => {
  it('returns YYYY-MM of the local date', () => {
    expect(currentMonthKey(new Date(2026, 0, 5))).toBe('2026-01')
  })
})

describe('monthRange', () => {
  it('returns inclusive first and last day', () => {
    expect(monthRange('2026-02')).toEqual({ from: '2026-02-01', to: '2026-02-28' })
    expect(monthRange('2028-02').to).toBe('2028-02-29')
    expect(monthRange('2026-12')).toEqual({ from: '2026-12-01', to: '2026-12-31' })
  })
})

describe('shiftMonth / lastNMonths', () => {
  it('crosses year boundaries', () => {
    expect(shiftMonth('2026-01', -1)).toBe('2025-12')
    expect(shiftMonth('2026-12', 1)).toBe('2027-01')
    expect(lastNMonths('2027-02', 6)).toEqual(['2026-09', '2026-10', '2026-11', '2026-12', '2027-01', '2027-02'])
  })
})

describe('display formats', () => {
  it('formats dates and months in en-GB', () => {
    expect(formatDisplayDate('2026-09-30')).toBe('30 Sep 2026')
    expect(formatDisplayDate('2026-01-01')).toBe('1 Jan 2026')
    expect(formatMonthLabel('2026-09')).toBe('Sep 2026')
  })
})
