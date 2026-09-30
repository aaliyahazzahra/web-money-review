import { clearActivity, markActive } from '../lib/inactivity'
import { getStorage } from '../lib/storage'
import { InvalidCredentialsError, throwIfError } from './errors'
import { supabase } from './supabase'

function throwAuthError(error: { status?: number; message: string } | null): void {
  if (!error) return
  if (error.status === 400) throw new InvalidCredentialsError()
  throw new Error(error.message)
}

export async function signIn(email: string, password: string): Promise<void> {
  const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password })
  throwAuthError(error)
  // Catatan aktivitas lama (mis. sebelum logout minggu lalu) tidak boleh langsung memicu logout otomatis.
  markActive(getStorage(), Date.now())
  // Log login hanya pelengkap: kegagalannya tidak boleh menggagalkan login.
  try {
    await supabase.rpc('fn_log_activity', { p_activity: 'login' })
  } catch {
    // diabaikan
  }
}

export async function signOut(): Promise<void> {
  // scope 'local': hanya perangkat ini; sesi di HP/laptop lain tetap berjalan.
  const { error } = await supabase.auth.signOut({ scope: 'local' })
  clearActivity(getStorage())
  throwIfError(error)
}

export async function isSignedIn(): Promise<boolean> {
  const { data } = await supabase.auth.getSession()
  return data.session !== null
}

export function onAuthChange(cb: (signedIn: boolean) => void): () => void {
  const { data } = supabase.auth.onAuthStateChange((_event, session) => cb(session !== null))
  return () => data.subscription.unsubscribe()
}

/** Verifikasi password lama dengan login ulang, lalu ganti password. */
export async function changePassword(current: string, next: string): Promise<void> {
  const { data } = await supabase.auth.getSession()
  const email = data.session?.user.email
  if (!email) throw new Error('Not signed in')
  const { error: verifyError } = await supabase.auth.signInWithPassword({ email, password: current })
  throwAuthError(verifyError)
  const { error } = await supabase.auth.updateUser({ password: next })
  throwIfError(error)
}
