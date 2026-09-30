import { CATEGORY_COLORS, categoryColorFor } from './icons'

describe('category colors', () => {
  it('uses the validated 7-hue palette without red', () => {
    expect(CATEGORY_COLORS).toEqual(['#2a78d6', '#eb6834', '#1baf7a', '#eda100', '#e87ba4', '#008300', '#4a3aa7'])
  })
  it('maps stored light colors to their dark-mode step', () => {
    expect(categoryColorFor('#2a78d6', 'dark')).toBe('#3987e5')
    expect(categoryColorFor('#4A3AA7', 'dark')).toBe('#9085e9')
    expect(categoryColorFor('#2a78d6', 'light')).toBe('#2a78d6')
    expect(categoryColorFor('#123456', 'dark')).toBe('#123456')
  })
})
