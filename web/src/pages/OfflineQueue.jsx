import { useState } from 'react'
import { WifiOff, Clock, CheckCircle, PlayCircle, Plus } from 'lucide-react'
import { useWallet } from '../lib/wallet-store'
import { formatDate } from '../lib/utils'
import { Card, Button, Input, SectionHeader, Badge } from '../components/ui'
import { toast } from 'sonner'

const METHOD_LABELS = { sms: 'SMS Relay', ble: 'BLE', ussd: 'USSD' }

export default function OfflineQueue() {
  const { offlineQueue, addToOfflineQueue, processOfflineItem } = useWallet()
  const [showAdd, setShowAdd] = useState(false)
  const [form, setForm] = useState({ description: '', amount: '', recipient: '', method: 'sms' })

  const queued     = offlineQueue.filter(i => i.status === 'queued')
  const processing = offlineQueue.filter(i => i.status === 'processing')
  const confirmed  = offlineQueue.filter(i => i.status === 'confirmed')

  const addItem = () => {
    const sats = parseInt(form.amount)
    if (!form.description || !sats) { toast.error('Fill in description and amount'); return }
    addToOfflineQueue({ ...form, amount: sats })
    setForm({ description: '', amount: '', recipient: '', method: 'sms' })
    setShowAdd(false)
    toast.success('Added to offline queue')
  }

  const process = (id) => {
    processOfflineItem(id)
    toast.info('Processing via SMS relay…')
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-start justify-between">
        <SectionHeader title="Offline Queue" subtitle="Payments queued for when connectivity is available" />
        <Button size="sm" onClick={() => setShowAdd(v => !v)}>
          <Plus className="w-4 h-4" /> Queue Payment
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="p-4 text-center">
          <p className="text-2xl font-bold font-mono text-yellow-400">{queued.length}</p>
          <p className="text-xs text-muted-foreground mt-1">Queued</p>
        </Card>
        <Card className="p-4 text-center">
          <p className="text-2xl font-bold font-mono text-blue-400">{processing.length}</p>
          <p className="text-xs text-muted-foreground mt-1">Processing</p>
        </Card>
        <Card className="p-4 text-center">
          <p className="text-2xl font-bold font-mono text-green-400">{confirmed.length}</p>
          <p className="text-xs text-muted-foreground mt-1">Confirmed</p>
        </Card>
      </div>

      {/* Add form */}
      {showAdd && (
        <Card className="p-5 space-y-3 border-primary/30">
          <h3 className="text-sm font-semibold text-foreground">Queue Offline Payment</h3>
          <Input label="Description"   value={form.description} onChange={e => setForm(f=>({...f, description:e.target.value}))} placeholder="e.g. Market payment" />
          <Input label="Amount (sats)" type="number" value={form.amount} onChange={e => setForm(f=>({...f, amount:e.target.value}))} placeholder="e.g. 1200" />
          <Input label="Recipient ID"  value={form.recipient}   onChange={e => setForm(f=>({...f, recipient:e.target.value}))} placeholder="e.g. MKT-001 or phone number" />
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Relay Method</label>
            <select
              value={form.method}
              onChange={e => setForm(f=>({...f, method:e.target.value}))}
              className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="sms">SMS Relay</option>
              <option value="ble">BLE Proximity</option>
              <option value="ussd">USSD</option>
            </select>
          </div>
          <div className="flex gap-2">
            <Button className="flex-1" onClick={addItem}>Add to Queue</Button>
            <Button variant="outline" onClick={() => setShowAdd(false)}>Cancel</Button>
          </div>
        </Card>
      )}

      {/* Queued */}
      {queued.length > 0 && (
        <section>
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Pending</h3>
          <div className="space-y-2">
            {queued.map(item => <QueueItem key={item.id} item={item} onProcess={process} />)}
          </div>
        </section>
      )}

      {/* Processing */}
      {processing.length > 0 && (
        <section>
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Processing</h3>
          <div className="space-y-2">
            {processing.map(item => <QueueItem key={item.id} item={item} />)}
          </div>
        </section>
      )}

      {/* Confirmed */}
      {confirmed.length > 0 && (
        <section>
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Confirmed</h3>
          <div className="space-y-2">
            {confirmed.map(item => <QueueItem key={item.id} item={item} />)}
          </div>
        </section>
      )}

      {offlineQueue.length === 0 && (
        <Card className="p-12 text-center">
          <WifiOff className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">No offline payments queued</p>
        </Card>
      )}

      {/* Offline Flow diagram */}
      <Card className="p-5">
        <h3 className="text-sm font-semibold text-foreground mb-4">How Offline Payments Work</h3>
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          {[
            { step: '01', name: 'BLE Scan',   sub: 'Detect nearby'    },
            { step: '02', name: 'Encode',     sub: 'Base58 compress'  },
            { step: '03', name: 'SMS Relay',  sub: 'To relay node',   highlight: true },
            { step: '04', name: 'Pi Node',    sub: 'Process + sign'   },
            { step: '05', name: 'Broadcast',  sub: 'When online'      },
            { step: '06', name: 'Confirmed',  sub: 'SMS receipt',     highlight: true },
          ].map((s, i, arr) => (
            <div key={s.step} className="flex items-center gap-2 flex-shrink-0">
              <div className={`rounded-lg p-3 text-center min-w-[90px] border ${s.highlight ? 'border-primary/30 bg-primary/5' : 'bg-secondary border-border'}`}>
                <div className="text-[10px] font-mono text-primary mb-1">{s.step}</div>
                <div className="text-xs font-semibold text-foreground">{s.name}</div>
                <div className="text-[10px] text-muted-foreground mt-0.5">{s.sub}</div>
              </div>
              {i < arr.length - 1 && <span className="text-muted-foreground text-sm">→</span>}
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}

function QueueItem({ item, onProcess }) {
  const statusMap = {
    queued:     { badge: 'yellow', icon: Clock,        label: 'Queued'     },
    processing: { badge: 'blue',   icon: PlayCircle,   label: 'Processing' },
    confirmed:  { badge: 'green',  icon: CheckCircle,  label: 'Confirmed'  },
  }
  const { badge, icon: Icon, label } = statusMap[item.status] || statusMap.queued

  return (
    <div className="flex items-center gap-3 p-4 rounded-xl bg-secondary/30 border border-border hover:bg-secondary/50 transition-all">
      <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
        <WifiOff className="w-4 h-4 text-primary" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground">{item.description}</p>
        <p className="text-xs text-muted-foreground">
          {item.recipient && `→ ${item.recipient} · `}{METHOD_LABELS[item.method] || item.method} · {formatDate(item.date)}
        </p>
      </div>
      <div className="text-right flex flex-col items-end gap-1.5">
        <p className="text-sm font-mono font-semibold text-foreground">{item.amount.toLocaleString()} sats</p>
        <Badge variant={badge}>{label}</Badge>
      </div>
      {item.status === 'queued' && onProcess && (
        <Button size="sm" variant="outline" onClick={() => onProcess(item.id)}>
          Send
        </Button>
      )}
    </div>
  )
}
