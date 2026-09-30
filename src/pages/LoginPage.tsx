import { Wallet } from 'lucide-react'
import { type FormEvent, useState } from 'react'
import { useLocation, useNavigate } from 'react-router'
import { fieldError, input, label, primaryButton } from '../components/ui'
import { signIn } from '../services/auth'

export function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const expired = (location.state as { expired?: boolean } | null)?.expired === true
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (submitting) return
    setSubmitting(true)
    setError(null)
    try {
      await signIn(email, password)
      navigate('/', { replace: true })
    } catch (err) {
      // Tampilkan alasan asli dari Supabase (mis. "Email not confirmed") agar mudah didiagnosis.
      setError(err instanceof Error && err.message ? err.message : 'Failed to log in, try again')
      setSubmitting(false)
    }
  }

  return (
    <main className="flex min-h-dvh items-center justify-center px-4">
      <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-4">
        <div className="mb-8 flex flex-col items-center gap-3 text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-on-primary">
            <Wallet size={28} aria-hidden />
          </span>
          <h1 className="text-2xl font-bold">Money Review</h1>
        </div>

        {expired && !error && (
          <p role="status" className="rounded-xl bg-surface px-3 py-2 text-sm">
            Session expired, please log in
          </p>
        )}

        <div>
          <label htmlFor="email" className={label}>Email</label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            required
            className={input}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="password" className={label}>Password</label>
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            required
            className={input}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        {error && <p role="alert" className={fieldError}>{error}</p>}

        <button type="submit" className={`${primaryButton} w-full`} disabled={submitting}>
          Log in
        </button>
      </form>
    </main>
  )
}
