import { useEffect, useState } from 'react'
import { isSignedIn, onAuthChange } from '../services/auth'

export type AuthStatus = 'loading' | 'signedIn' | 'signedOut'

export function useAuth(): AuthStatus {
  const [status, setStatus] = useState<AuthStatus>('loading')

  useEffect(() => {
    let active = true
    isSignedIn()
      .then((signedIn) => active && setStatus(signedIn ? 'signedIn' : 'signedOut'))
      .catch(() => active && setStatus('signedOut'))
    const unsubscribe = onAuthChange((signedIn) => setStatus(signedIn ? 'signedIn' : 'signedOut'))
    return () => {
      active = false
      unsubscribe()
    }
  }, [])

  return status
}
