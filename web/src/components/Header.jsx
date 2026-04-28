import { useState } from 'react'
import { Menu, Zap, Bell } from 'lucide-react'

export default function Header({ onMenuClick }) {
  const [hasNotif] = useState(true)

  return (
    <header className="h-16 border-b border-border bg-card/80 backdrop-blur-xl flex items-center justify-between px-4 lg:px-6 sticky top-0 z-30">
      <button
        onClick={onMenuClick}
        className="lg:hidden p-2 rounded-md hover:bg-secondary text-muted-foreground"
      >
        <Menu className="w-5 h-5" />
      </button>

      <div className="hidden lg:block" />

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20">
          <Zap className="w-3.5 h-3.5 text-primary" />
          <span className="text-xs font-mono text-primary">Testnet</span>
        </div>

        <button className="relative p-2 rounded-md hover:bg-secondary text-muted-foreground">
          <Bell className="w-4 h-4" />
          {hasNotif && (
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary rounded-full" />
          )}
        </button>
      </div>
    </header>
  )
}
