const auth = {
  signInWithPassword: vi.fn(),
  signOut: vi.fn(),
}
const rpc = vi.fn()
vi.mock('./supabase', () => ({ supabase: { auth, rpc: (...a: unknown[]) => rpc(...a) } }))

const { signIn, signOut } = await import('./auth')

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
})
