import { Link } from 'react-router-dom'
import { ArrowUp, ArrowDown, QrCode, WifiOff, ArrowUpRight, ArrowDownLeft, Activity, Zap, Clock, TrendingUp, Eye } from 'lucide-react'
import { useWallet } from '../lib/wallet-store'
import { formatSats, formatDate } from '../lib/utils'
import { Card, SectionHeader, Badge } from '../components/ui'

export default function Dashboard() {
  const { balance, transactions, totalSent, totalReceived, offlineQueue } = useWallet()

  const pendingOffline = offlineQueue.filter(i => i.status === 'queued').length

  const ACTION_BUTTONS = [
    { to: '/transact?tab=send',    icon: ArrowUp,   label: 'Send',       color: 'bg-red-500/10 border-red-500/20 text-red-400'    },
    { to: '/transact?tab=receive', icon: ArrowDown,  label: 'Receive',    color: 'bg-green-500/10 border-green-500/20 text-green-400' },
    { to: '/transact?tab=receive', icon: QrCode,     label: 'Scan QR',    color: 'bg-blue-500/10 border-blue-500/20 text-blue-400'  },
    { to: '/offline',              icon: WifiOff,    label: 'Offline Pay', color: 'bg-primary/10 border-primary/20 text-primary'    },
  ]

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <SectionHeader title="Dashboard" subtitle="Your Bitcoin Lightning wallet overview" />

      {/* Balance Card */}
      <Card className="relative overflow-hidden p-6 lg:p-8 bg-gradient-to-br from-primary/20 via-card to-card border-primary/10">
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-32 h-32 bg-primary/5 rounded-full blur-2xl pointer-events-none" />
        <div className="relative">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
                <Zap className="w-4 h-4 text-primary" />
              </div>
              <span className="text-sm font-medium text-muted-foreground">Total Balance</span>
            </div>
            <button className="p-2 rounded-md hover:bg-secondary text-muted-foreground">
              <Eye className="w-4 h-4" />
            </button>
          </div>
          <div className="space-y-1">
            <h2 className="text-4xl lg:text-5xl font-bold text-foreground tracking-tight">
              ₿ {(balance / 100_000_000).toFixed(8)}
            </h2>
            <p className="text-lg font-mono text-primary">{formatSats(balance)} sats</p>
          </div>
          <div className="flex items-center gap-2 mt-4 text-sm text-green-400">
            <TrendingUp className="w-4 h-4" />
            <span className="font-medium">Lightning Ready</span>
          </div>
        </div>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-4 gap-3">
        {ACTION_BUTTONS.map(({ to, icon: Icon, label, color }) => (
          <Link
            key={label}
            to={to}
            className={`flex flex-col items-center gap-2 p-4 rounded-xl border transition-all hover:scale-105 ${color}`}
          >
            <Icon className="w-5 h-5" />
            <span className="text-xs font-medium text-foreground">{label}</span>
          </Link>
        ))}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Card className="p-4">
          <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center mb-3">
            <ArrowUpRight className="w-4 h-4 text-red-400" />
          </div>
          <p className="text-lg font-bold text-foreground font-mono">{formatSats(totalSent)} sats</p>
          <p className="text-xs text-muted-foreground mt-0.5">Total Sent</p>
        </Card>
        <Card className="p-4">
          <div className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center mb-3">
            <ArrowDownLeft className="w-4 h-4 text-green-400" />
          </div>
          <p className="text-lg font-bold text-foreground font-mono">{formatSats(totalReceived)} sats</p>
          <p className="text-xs text-muted-foreground mt-0.5">Total Received</p>
        </Card>
        <Card className="p-4">
          <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center mb-3">
            <Activity className="w-4 h-4 text-blue-400" />
          </div>
          <p className="text-lg font-bold text-foreground font-mono">{transactions.length}</p>
          <p className="text-xs text-muted-foreground mt-0.5">Transactions</p>
        </Card>
        <Card className="p-4">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center mb-3">
            <WifiOff className="w-4 h-4 text-primary" />
          </div>
          <p className="text-lg font-bold text-foreground font-mono">{pendingOffline}</p>
          <p className="text-xs text-muted-foreground mt-0.5">Offline Queue</p>
        </Card>
      </div>

      {/* Transactions */}
      <Card className="p-5">
        <h3 className="text-base font-semibold text-foreground mb-4">Recent Transactions</h3>
        {transactions.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">No transactions yet</p>
        ) : (
          <div className="space-y-2">
            {transactions.slice(0, 10).map(tx => (
              <TxRow key={tx.id} tx={tx} />
            ))}
          </div>
        )}
      </Card>
    </div>
  )
}

function TxRow({ tx }) {
  const isReceive = tx.type === 'receive'
  return (
    <div className="flex items-center gap-3 p-3 rounded-xl bg-secondary/30 hover:bg-secondary/50 transition-all">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isReceive ? 'bg-green-500/10' : 'bg-red-500/10'}`}>
        {isReceive
          ? <ArrowDownLeft className="w-4 h-4 text-green-400" />
          : <ArrowUpRight  className="w-4 h-4 text-red-400"   />
        }
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-foreground truncate">{tx.description}</span>
          <Zap className="w-3 h-3 text-primary flex-shrink-0" />
        </div>
        <div className="flex items-center gap-2 mt-0.5">
          <Clock className="w-3 h-3 text-yellow-400" />
          <StatusBadge status={tx.status} />
          <span className="text-[11px] text-muted-foreground">·</span>
          <span className="text-[11px] text-muted-foreground">{formatDate(tx.date)}</span>
        </div>
      </div>
      <div className="text-right">
        <p className={`text-sm font-mono font-semibold ${isReceive ? 'text-green-400' : 'text-red-400'}`}>
          {isReceive ? '+' : '-'}{formatSats(tx.amount)}
        </p>
        <p className="text-[10px] text-muted-foreground font-mono">sats</p>
      </div>
    </div>
  )
}

function StatusBadge({ status }) {
  const map = {
    pending:   <Badge variant="yellow">Pending</Badge>,
    confirmed: <Badge variant="green">Confirmed</Badge>,
    failed:    <Badge variant="red">Failed</Badge>,
  }
  return map[status] || <Badge variant="gray">{status}</Badge>
}

