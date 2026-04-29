import { NavLink } from 'react-router-dom'
import {
  Wallet, ArrowUpDown, Store, WifiOff,
  Terminal, Signal, Settings, Zap, X, User,
} from 'lucide-react'

const NAV_ITEMS = [
  { to: '/',         icon: Wallet,      label: 'Dashboard'      },
  { to: '/transact', icon: ArrowUpDown, label: 'Send & Receive' },
  { to: '/merchant', icon: Store,       label: 'Merchant'       },
  { to: '/offline',  icon: WifiOff,     label: 'Offline Queue'  },
  { to: '/ussd',     icon: Terminal,    label: 'USSD Simulator' },
  { to: '/relay',    icon: Signal,      label: 'Relay Network'  },
  { to: '/settings', icon: Settings,    label: 'Settings'       },
  { to: '/profile',  icon: User,        label: 'Profile'        },
]

export default function Sidebar({ open, onClose }) {
  return (
    <>
      {/* Overlay for mobile */}
      {open && (
        <div
          className="fixed inset-0 bg-black/60 z-40 lg:hidden"
          onClick={onClose}
        />
      )}
      <aside className={`
        fixed top-0 left-0 h-full w-64 bg-card border-r border-border z-50 flex flex-col
        transition-transform duration-300
        ${open ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0
      `}>
        {/* Brand */}
        <div className="p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
              <Zap className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="text-base font-bold text-foreground tracking-tight">Chuma Pay</h1>
              <span className="text-[10px] font-mono text-primary uppercase tracking-widest">Testnet</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden p-2 rounded-md hover:bg-secondary text-muted-foreground"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all
                ${isActive
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
                }`
              }
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Node status */}
        <div className="p-4 m-3 rounded-lg bg-secondary/50 border border-border">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-xs font-medium text-foreground">Node Online</span>
          </div>
          <p className="text-[11px] text-muted-foreground font-mono">testnet · lightning</p>
        </div>
      </aside>
    </>
  )
}
