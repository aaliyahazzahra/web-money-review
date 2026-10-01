import { render } from '@testing-library/react'
import { AppLogo } from './AppLogo'

describe('AppLogo', () => {
  it('renders the decorative Librasica mark at the requested size', () => {
    const { container } = render(<AppLogo size={40} />)
    const svg = container.querySelector('svg')!
    expect(svg).toHaveAttribute('width', '40')
    expect(svg).toHaveAttribute('height', '40')
    expect(svg).toHaveAttribute('aria-hidden', 'true')
    expect(svg).toHaveAttribute('data-logo', 'librasica')
  })
})
