import type { ReactNode } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router'
import { AppLayout } from './components/AppLayout'
import { useAuth } from './hooks/useAuth'
import { ChartsPage } from './pages/ChartsPage'
import { HomePage } from './pages/HomePage'
import { LoginPage } from './pages/LoginPage'
import { SettingsPage } from './pages/SettingsPage'
import { TransactionsPage } from './pages/TransactionsPage'

function FullScreenLoading() {
  return <div aria-busy="true" aria-label="Loading" className="min-h-dvh animate-pulse bg-bg" />
}

function RequireAuth({ children }: { children: ReactNode }) {
  const status = useAuth()
  if (status === 'loading') return <FullScreenLoading />
  if (status === 'signedOut') return <Navigate to="/login" replace />
  return <>{children}</>
}

function LoginRoute() {
  const status = useAuth()
  if (status === 'loading') return <FullScreenLoading />
  if (status === 'signedIn') return <Navigate to="/" replace />
  return <LoginPage />
}

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginRoute />} />
        <Route
          element={
            <RequireAuth>
              <AppLayout />
            </RequireAuth>
          }
        >
          <Route index element={<HomePage />} />
          <Route path="transactions" element={<TransactionsPage />} />
          <Route path="charts" element={<ChartsPage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
