import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router'
import { EmailNotConfirmedError, InvalidCredentialsError } from '../services/errors'

const signIn = vi.fn()
vi.mock('../services/auth', () => ({ signIn: (...a: unknown[]) => signIn(...a) }))

const { LoginPage } = await import('./LoginPage')

function renderLogin(state?: unknown) {
  return render(
    <MemoryRouter initialEntries={[{ pathname: '/login', state }]}>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={<p>home page</p>} />
      </Routes>
    </MemoryRouter>,
  )
}

async function fillAndSubmit() {
  await userEvent.type(screen.getByLabelText('Email'), 'me@example.com')
  await userEvent.type(screen.getByLabelText('Password'), 'secret123')
  await userEvent.click(screen.getByRole('button', { name: 'Log in' }))
}

beforeEach(() => {
  signIn.mockReset()
})

describe('LoginPage', () => {
  it('signs in and goes home', async () => {
    signIn.mockResolvedValue(undefined)
    renderLogin()
    await fillAndSubmit()
    expect(signIn).toHaveBeenCalledWith('me@example.com', 'secret123')
    expect(await screen.findByText('home page')).toBeInTheDocument()
  })

  it('shows a short error on invalid credentials', async () => {
    signIn.mockRejectedValue(new InvalidCredentialsError())
    renderLogin()
    await fillAndSubmit()
    expect(await screen.findByText('Invalid email or password')).toBeInTheDocument()
  })

  it('shows the real reason for other failures', async () => {
    signIn.mockRejectedValue(new EmailNotConfirmedError())
    renderLogin()
    await fillAndSubmit()
    expect(await screen.findByText('Email not confirmed')).toBeInTheDocument()
  })

  it('disables the button while signing in', async () => {
    signIn.mockReturnValue(new Promise(() => {}))
    renderLogin()
    await fillAndSubmit()
    expect(screen.getByRole('button', { name: 'Log in' })).toBeDisabled()
  })

  it('shows the app name', () => {
    renderLogin()
    expect(screen.getByRole('heading', { name: 'Librasica' })).toBeInTheDocument()
    expect(document.querySelector('svg[data-logo="librasica"]')).toBeInTheDocument()
  })

  it('shows the expired-session message and no sign-up link', () => {
    renderLogin({ expired: true })
    expect(screen.getByText('Session expired, please log in')).toBeInTheDocument()
    expect(screen.queryByText(/sign up/i)).not.toBeInTheDocument()
  })
})
