import { useEffect } from 'react'
import { useNavigate } from 'react-router'
import { isInactive, readLastActivity, recordActivity } from '../lib/inactivity'
import { signOut } from '../services/auth'

/** Logout otomatis bila app tidak dipakai lebih dari 7 hari (spec §5.5). */
export function useInactivityGuard(): void {
  const navigate = useNavigate()

  useEffect(() => {
    let signingOut = false

    const check = () => {
      if (signingOut) return
      const now = Date.now()
      if (isInactive(readLastActivity(localStorage), now)) {
        signingOut = true
        // Hapus catatan lama supaya login berikutnya tidak langsung dianggap tidak aktif.
        try {
          localStorage.removeItem('mr:lastActivity')
        } catch {
          // storage diblokir: abaikan
        }
        signOut()
          .catch(() => undefined)
          .finally(() => navigate('/login', { replace: true, state: { expired: true } }))
      } else {
        recordActivity(localStorage, now)
      }
    }
    const onVisible = () => {
      if (document.visibilityState === 'visible') check()
    }
    const onInteract = () => recordActivity(localStorage, Date.now())

    check()
    document.addEventListener('visibilitychange', onVisible)
    window.addEventListener('pointerdown', onInteract)
    window.addEventListener('keydown', onInteract)
    return () => {
      document.removeEventListener('visibilitychange', onVisible)
      window.removeEventListener('pointerdown', onInteract)
      window.removeEventListener('keydown', onInteract)
    }
  }, [navigate])
}
