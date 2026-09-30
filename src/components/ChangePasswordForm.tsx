import { type FormEvent, useState } from 'react'
import { changePassword } from '../services/auth'
import { InvalidCredentialsError } from '../services/errors'
import { useToast } from './Toast'
import { fieldError, input, label, primaryButton } from './ui'

const MIN_LENGTH = 8

export function ChangePasswordForm() {
  const [current, setCurrent] = useState('')
  const [next, setNext] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const toast = useToast()

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (saving) return
    if (next.length < MIN_LENGTH) return setError('Password must be at least 8 characters')
    if (next !== confirm) return setError('Passwords do not match')
    setError(null)
    setSaving(true)
    try {
      await changePassword(current, next)
      setCurrent('')
      setNext('')
      setConfirm('')
      toast.show('Password changed')
    } catch (err) {
      setError(err instanceof InvalidCredentialsError ? 'Current password is incorrect' : 'Failed to change password, try again')
    } finally {
      setSaving(false)
    }
  }

  const fields = [
    { id: 'current-password', text: 'Current password', value: current, set: setCurrent, auto: 'current-password' },
    { id: 'new-password', text: 'New password', value: next, set: setNext, auto: 'new-password' },
    { id: 'confirm-password', text: 'Confirm new password', value: confirm, set: setConfirm, auto: 'new-password' },
  ]

  return (
    <form onSubmit={handleSubmit} className="space-y-3" noValidate>
      {fields.map((f) => (
        <div key={f.id}>
          <label htmlFor={f.id} className={label}>{f.text}</label>
          <input
            id={f.id}
            type="password"
            autoComplete={f.auto}
            className={input}
            value={f.value}
            onChange={(e) => f.set(e.target.value)}
          />
        </div>
      ))}
      {error && <p role="alert" className={fieldError}>{error}</p>}
      <button type="submit" className={primaryButton} disabled={saving}>Change password</button>
    </form>
  )
}
