describe('test setup', () => {
  it('runs vitest with jsdom', () => {
    expect(1 + 1).toBe(2)
    expect(document.createElement('div')).toBeInstanceOf(HTMLElement)
  })
})
