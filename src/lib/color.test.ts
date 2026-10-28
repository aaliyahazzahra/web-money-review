import {
  hexToHsl, hslToHex, iconColorOn, isHexColor, normalizeHex, spectrumColor, spectrumPosition, suggestCategoryColor, SWATCH_GRID,
} from './color'
import { CATEGORY_COLORS } from './icons'

describe('color helpers', () => {
  it('validates and normalizes hex input', () => {
    expect(isHexColor('#A1b2C3')).toBe(true)
    expect(isHexColor('#fff')).toBe(false)
    expect(normalizeHex('F0a')).toBe('#ff00aa')
    expect(normalizeHex(' #A1B2C3 ')).toBe('#a1b2c3')
    expect(normalizeHex('#12345g')).toBeNull()
    expect(normalizeHex('red')).toBeNull()
  })

  it('round-trips between hex and hsl', () => {
    expect(hslToHex({ h: 0, s: 100, l: 50 })).toBe('#ff0000')
    expect(hslToHex({ h: 120, s: 100, l: 25 })).toBe('#008000')
    for (const c of CATEGORY_COLORS) expect(hslToHex(hexToHsl(c))).toBe(c)
  })

  it('maps the spectrum: left white, right black, hue top to bottom', () => {
    expect(spectrumColor(0, 0.3)).toBe('#ffffff')
    expect(spectrumColor(1, 0.3)).toBe('#000000')
    expect(spectrumColor(0.5, 0)).toBe('#ff0000')
    expect(spectrumColor(0.5, 1 / 3)).toBe('#00ff00')
    const pos = spectrumPosition('#0000ff')
    expect(pos.x).toBeCloseTo(0.5)
    expect(pos.y).toBeCloseTo(2 / 3)
  })

  it('builds a grid of a gray row plus 9 hue rows, all valid and unique', () => {
    expect(SWATCH_GRID).toHaveLength(10)
    expect(SWATCH_GRID[0][0]).toBe('#ffffff')
    expect(SWATCH_GRID[0].at(-1)).toBe('#000000')
    const flat = SWATCH_GRID.flat()
    expect(flat.every(isHexColor)).toBe(true)
    expect(new Set(flat).size).toBe(flat.length)
  })

  it('keeps icons readable on light and dark backgrounds', () => {
    expect(iconColorOn('#2a78d6')).toBe('#ffffff')
    expect(iconColorOn('#000000')).toBe('#ffffff')
    expect(iconColorOn('#ffffff')).toBe('#1c1917')
    expect(iconColorOn('#fff59d')).toBe('#1c1917')
  })

  it('suggests the least-used palette color, in palette order', () => {
    expect(suggestCategoryColor(['#2a78d6', '#EB6834', '#2a78d6'])).toBe('#1baf7a')
    expect(suggestCategoryColor(CATEGORY_COLORS)).toBe(CATEGORY_COLORS[0])
    expect(suggestCategoryColor([])).toBe(CATEGORY_COLORS[0])
  })
})
