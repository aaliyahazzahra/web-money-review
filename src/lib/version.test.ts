import { APP_VERSION_LABEL, formatVersion } from './version'

describe('formatVersion', () => {
  it('adds the short commit when the build has one', () => {
    expect(formatVersion('0.3.0', '8e0da4e1234abcd')).toBe('v0.3.0 · 8e0da4e')
  })
  it('shows only the version for local builds without a commit', () => {
    expect(formatVersion('0.3.0', '')).toBe('v0.3.0')
  })
})

describe('APP_VERSION_LABEL', () => {
  it('uses the version from package.json', async () => {
    const pkg = await import('../../package.json')
    expect(APP_VERSION_LABEL.startsWith(`v${pkg.version}`)).toBe(true)
  })
})
