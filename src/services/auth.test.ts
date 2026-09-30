const auth = {
  signInWithPassword: vi.fn(),
  signOut: vi.fn(),
}
const rpc = vi.fn()
vi.mock('./supabase', () => ({ supabase: { auth, rpc: (...a: unknown[]) => rpc(...a) } }))

const { signIn, signOut } = await import('./auth')
const { EmailNotConfirmedError, InvalidCredentialsError } = await import('./errors')

beforeEach(() => {
  auth.signInWithPassword.mockReset().mockResolvedValue({ error: null })
  auth.signOut.mockReset().mockResolvedValue({ error: null })
  rpc.mockReset().mockResolvedValue({ error: null })
  localStorage.clear()
})

describe('auth service', () => {
  it('signs out only this device', async () => {
    await signOut()
    expect(auth.signOut).toHaveBeenCalledWith({ scope: 'local' })
  })

  it('marks the session active right after signing in (stale record from last week is replaced)', async () => {
    localStorage.setItem('mr:lastActivity', String(Date.now() - 8 * 24 * 60 * 60 * 1000))
    await signIn('me@example.com', 'secret123')
    const stored = Number(localStorage.getItem('mr:lastActivity'))
    expect(Date.now() - stored).toBeLessThan(5_000)
  })

  it('clears the activity record on sign out', async () => {
    localStorage.setItem('mr:lastActivity', '123')
    await signOut()
    expect(localStorage.getItem('mr:lastActivity')).toBeNull()
  })

  it('maps wrong password to InvalidCredentialsError', async () => {
    auth.signInWithPassword.mockResolvedValue({ error: { status: 400, code: 'invalid_credentials', message: 'Invalid login credentials' } })
    await expect(signIn('me@example.com', 'x')).rejects.toBeInstanceOf(InvalidCredentialsError)
  })

  it('reports an unconfirmed email instead of a wrong password', async () => {
    auth.signInWithPassword.mockResolvedValue({ error: { status: 400, code: 'email_not_confirmed', message: 'Email not confirmed' } })
    const err = await signIn('me@example.com', 'x').catch((e) => e)
    expect(err).toBeInstanceOf(EmailNotConfirmedError)
    expect(err.message).toBe('Email not confirmed')
  })

  it('passes other auth errors through with their message', async () => {
    auth.signInWithPassword.mockResolvedValue({ error: { status: 400, code: 'validation_failed', message: 'Unsupported grant type' } })
    const err = await signIn('me@example.com', 'x').catch((e) => e)
    expect(err).not.toBeInstanceOf(InvalidCredentialsError)
    expect(err.message).toBe('Unsupported grant type')
  })
})
