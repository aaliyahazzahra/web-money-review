import { MAX_AMOUNT, formatAmountInput, formatRupiah, formatSignedRupiah, parseAmountInput } from './money'

describe('formatRupiah', () => {
  it('formats with dot thousands separator and a normal space', () => {
    expect(formatRupiah(25000)).toBe('Rp 25.000')
    expect(formatRupiah(0)).toBe('Rp 0')
    expect(formatRupiah(1234567)).toBe('Rp 1.234.567')
    expect(formatRupiah(MAX_AMOUNT)).toBe('Rp 999.999.999.999')
  })
})

describe('formatSignedRupiah', () => {
  it('prefixes expense with minus sign (U+2212) and income with plus', () => {
    expect(formatSignedRupiah(25000, 'expense')).toBe('−Rp 25.000')
    expect(formatSignedRupiah(25000, 'income')).toBe('+Rp 25.000')
  })
})

describe('parseAmountInput', () => {
  it('parses plain and decorated digits', () => {
    expect(parseAmountInput('25000')).toBe(25000)
    expect(parseAmountInput('Rp 25.000')).toBe(25000)
    expect(parseAmountInput('25,000')).toBe(25000)
    expect(parseAmountInput(' 25000 ')).toBe(25000)
    expect(parseAmountInput('0')).toBe(0)
  })
  it('returns null for empty or digit-less input', () => {
    expect(parseAmountInput('')).toBeNull()
    expect(parseAmountInput('abc')).toBeNull()
  })
  it('returns null above MAX_AMOUNT', () => {
    expect(MAX_AMOUNT).toBe(999_999_999_999)
    expect(parseAmountInput('999999999999')).toBe(999_999_999_999)
    expect(parseAmountInput('1000000000000')).toBeNull()
  })
})

describe('formatAmountInput', () => {
  it('formats for the input field', () => {
    expect(formatAmountInput(25000)).toBe('25.000')
    expect(formatAmountInput(0)).toBe('0')
    expect(formatAmountInput(null)).toBe('')
  })
})
