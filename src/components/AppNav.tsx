import { ChartPie, House, List, type LucideIcon, Settings, Wallet } from 'lucide-react'
import { NavLink } from 'react-router'

const ITEMS: { to: string; label: string; icon: LucideIcon }[] = [
  { to: '/', label: 'Home', icon: House },
  { to: '/transactions', label: 'Transactions', icon: List },
  { to: '/charts', label: 'Charts', icon: ChartPie },
  { to: '/settings', label: 'Settings', icon: Settings },
]

export function AppNav() {
  return (
    <>
      {/* Laptop: sidebar kiri */}
      <nav aria-label="Main" className="fixed inset-y-0 left-0 hidden w-56 flex-col gap-1 border-r border-border bg-surface p-4 md:flex">
        <div className="mb-6 flex items-center gap-2 px-2 text-lg font-bold">
          <Wallet size={22} aria-hidden className="text-primary" /> Librasica
        </div>
        {ITEMS.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-xl border-l-4 px-3 py-2.5 font-medium ${
                isActive ? 'border-accent bg-bg text-text' : 'border-transparent text-muted hover:bg-bg/60'
              }`
            }
          >
            <Icon size={20} aria-hidden /> {label}
          </NavLink>
        ))}
      </nav>

      {/* HP: bilah bawah */}
      <nav
        aria-label="Main"
        className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-4 border-t border-border bg-surface pb-[env(safe-area-inset-bottom)] md:hidden"
      >
        {ITEMS.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `flex flex-col items-center gap-0.5 border-t-2 py-2 text-xs font-medium ${
                isActive ? 'border-accent text-text' : 'border-transparent text-muted'
              }`
            }
          >
            <Icon size={22} aria-hidden /> {label}
          </NavLink>
        ))}
      </nav>
    </>
  )
}
