import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router'

const signOut = vi.fn()
vi.mock('../services/auth', () => ({ signOut: () => signOut() }))

const { useInactivityGuard } = await import('./useInactivityGuard')

function Guarded() {
  useInactivityGuard()
  return <p>app</p>
}

function renderGuard() {
  return render(
    <MemoryRouter initialEntries={['/']}>
      <Routes>
        <Route path="/" element={<Guarded />} />
        <Route path="/login" element={<p>login page</p>} />
      </Routes>
    </MemoryRouter>,
  )
}

const DAY = 24 * 60 * 60 * 1000

beforeEach(() => {
  signOut.mockReset().mockResolvedValue(undefined)
  localStorage.clear()
})

describe('useInactivityGuard', () => {
  it('signs out once after more than 7 days of inactivity', async () => {
    localStorage.setItem('mr:lastActivity', String(Date.now() - 8 * DAY))
    renderGuard()
    expect(await screen.findByText('login page')).toBeInTheDocument()
    expect(signOut).toHaveBeenCalledTimes(1)
  })

  it('stays signed in when active within 7 days', () => {
    localStorage.setItem('mr:lastActivity', String(Date.now() - 1 * DAY))
    renderGuard()
    expect(screen.getByText('app')).toBeInTheDocument()
    expect(signOut).not.toHaveBeenCalled()
  })
})
