import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { APP_VERSION_LABEL } from '../lib/version'
import { AppNav } from './AppNav'

describe('AppNav', () => {
  it('shows the app version in the sidebar', () => {
    render(<MemoryRouter><AppNav /></MemoryRouter>)
    expect(screen.getByText(APP_VERSION_LABEL)).toBeInTheDocument()
  })
})
