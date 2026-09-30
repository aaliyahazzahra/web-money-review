import { Outlet } from 'react-router'
import { useInactivityGuard } from '../hooks/useInactivityGuard'
import { AppNav } from './AppNav'

export function AppLayout() {
  useInactivityGuard()
  return (
    <div className="min-h-dvh">
      <AppNav />
      <main className="mx-auto max-w-3xl px-4 pt-6 pb-28 md:ml-56 md:px-8 md:pb-10 lg:max-w-5xl">
        <Outlet />
      </main>
    </div>
  )
}

