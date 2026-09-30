import { LogOut, Monitor, Moon, Sun } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router'
import { CategoryManager } from '../components/CategoryManager'
import { ChangePasswordForm } from '../components/ChangePasswordForm'
import { PageTitle } from '../components/PageTitle'
import { useToast } from '../components/Toast'
import { card, secondaryButton } from '../components/ui'
import { useTheme } from '../hooks/useTheme'
import type { ThemePref } from '../lib/theme'
import { signOut } from '../services/auth'

const THEMES: { value: ThemePref; label: string; icon: typeof Sun }[] = [
  { value: 'system', label: 'System', icon: Monitor },
  { value: 'light', label: 'Light', icon: Sun },
  { value: 'dark', label: 'Dark', icon: Moon },
]

export function SettingsPage() {
  const { pref, setPref } = useTheme()
  const navigate = useNavigate()
  const toast = useToast()
  const [signingOut, setSigningOut] = useState(false)

  async function handleSignOut() {
    setSigningOut(true)
    try {
      await signOut()
      navigate('/login', { replace: true })
    } catch {
      toast.show('Failed to log out, try again', 'error')
      setSigningOut(false)
    }
  }

  return (
    <div className="space-y-4">
      <PageTitle>Settings</PageTitle>

      <section className={card} aria-labelledby="settings-categories">
        <h2 id="settings-categories" className="mb-3 text-lg font-semibold">Categories</h2>
        <CategoryManager />
      </section>

      <section className={card} aria-labelledby="settings-appearance">
        <h2 id="settings-appearance" className="mb-3 text-lg font-semibold">Appearance</h2>
        <div role="radiogroup" aria-label="Theme" className="grid grid-cols-3 gap-1 rounded-xl bg-bg p-1">
          {THEMES.map(({ value, label, icon: Icon }) => (
            <button
              key={value}
              type="button"
              role="radio"
              aria-checked={pref === value}
              onClick={() => setPref(value)}
              className={`flex items-center justify-center gap-1.5 rounded-lg py-2 text-sm font-semibold ${
                pref === value ? 'bg-surface text-text shadow-sm' : 'text-muted'
              }`}
            >
              <Icon size={16} aria-hidden /> {label}
            </button>
          ))}
        </div>
      </section>

      <section className={card} aria-labelledby="settings-password">
        <h2 id="settings-password" className="mb-3 text-lg font-semibold">Password</h2>
        <ChangePasswordForm />
      </section>

      <button type="button" className={`${secondaryButton} w-full`} onClick={handleSignOut} disabled={signingOut}>
        <LogOut size={18} aria-hidden /> Log out
      </button>
    </div>
  )
}
