import { cn } from '../lib/utils'

/* ── Card ─────────────────────────────────────────── */
export function Card({ className, children, ...props }) {
  return (
    <div className={cn('bg-card border border-border rounded-2xl', className)} {...props}>
      {children}
    </div>
  )
}

/* ── Button ───────────────────────────────────────── */
export function Button({ variant = 'default', size = 'md', className, children, ...props }) {
  const base = 'inline-flex items-center justify-center gap-2 font-medium rounded-lg transition-all focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:opacity-50 disabled:pointer-events-none'
  const variants = {
    default:  'bg-primary text-primary-foreground hover:bg-primary/90',
    outline:  'border border-border hover:bg-secondary text-foreground',
    ghost:    'hover:bg-secondary text-muted-foreground hover:text-foreground',
    danger:   'bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20',
    success:  'bg-green-500/10 border border-green-500/20 text-green-400 hover:bg-green-500/20',
  }
  const sizes = {
    sm:   'text-xs px-3 py-1.5',
    md:   'text-sm px-4 py-2',
    lg:   'text-base px-5 py-2.5',
    icon: 'w-9 h-9',
  }
  return (
    <button className={cn(base, variants[variant], sizes[size], className)} {...props}>
      {children}
    </button>
  )
}

/* ── Input ────────────────────────────────────────── */
export function Input({ label, className, ...props }) {
  return (
    <div className="space-y-1.5">
      {label && <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{label}</label>}
      <input
        className={cn(
          'w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground',
          'focus:outline-none focus:ring-1 focus:ring-primary transition-colors',
          className
        )}
        {...props}
      />
    </div>
  )
}

/* ── Badge ────────────────────────────────────────── */
export function Badge({ variant = 'gray', children, className }) {
  const variants = {
    orange: 'bg-orange-500/10 text-orange-400 border border-orange-500/20',
    green:  'bg-green-500/10  text-green-400  border border-green-500/20',
    red:    'bg-red-500/10    text-red-400    border border-red-500/20',
    blue:   'bg-blue-500/10   text-blue-400   border border-blue-500/20',
    yellow: 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20',
    gray:   'bg-secondary text-muted-foreground border border-border',
  }
  return (
    <span className={cn('inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium', variants[variant], className)}>
      {children}
    </span>
  )
}

/* ── Stat Card ────────────────────────────────────── */
export function StatCard({ label, value, icon: Icon, iconClass, children }) {
  return (
    <Card className="p-4">
      <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center mb-3', iconClass)}>
        {Icon && <Icon className="w-4 h-4" />}
      </div>
      <p className="text-lg font-bold text-foreground font-mono">{value}</p>
      <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
      {children}
    </Card>
  )
}

/* ── Section Header ───────────────────────────────── */
export function SectionHeader({ title, subtitle }) {
  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground">{title}</h1>
      {subtitle && <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>}
    </div>
  )
}

/* ── Empty State ──────────────────────────────────── */
export function EmptyState({ icon: Icon, title, description }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      {Icon && <Icon className="w-10 h-10 text-muted-foreground/40 mb-3" />}
      <p className="text-sm font-medium text-muted-foreground">{title}</p>
      {description && <p className="text-xs text-muted-foreground/60 mt-1">{description}</p>}
    </div>
  )
}
