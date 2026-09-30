import { useEffect } from 'react'
import { useNavigate } from 'react-router'
import { isInactive, readLastActivity, recordActivity } from '../lib/inactivity'
import { getStorage } from '../lib/storage'
import { signOut } from '../services/auth'

/** Logout otomatis bila app tidak dipakai lebih dari 7 hari (spec §5.5). */
export function useInactivityGuard(): void {
  const navigate = useNavigate()

  useEffect(() => {
    let signingOut = false

    const check = () => {
      if (signingOut) return
      const now = Date.now()
      if (isInactive(readLastActivity(getStorage()), now)) {
        signingOut = true
        signOut()
          .catch(() => undefined)
          .finally(() => navigate('/login', { replace: true, state: { expired: true } }))
      } else {
        recordActivity(getStorage(), now)
      }
    }
    const onVisible = () => {
      if (document.visibilityState === 'visible') check()
    }
    const onInteract = () => recordActivity(getStorage(), Date.now())

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
