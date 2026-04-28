import { useState, useRef, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Zap, Copy, Check } from 'lucide-react'
import { useWallet } from '../lib/wallet-store'
import { generateInvoiceId, drawQR } from '../lib/utils'
import { Card, Button, Input, SectionHeader } from '../components/ui'
import { toast } from 'sonner'

export default function Transact() {
  const [params] = useSearchParams()
  const [tab, setTab] = useState(params.get('tab') || 'send')

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <SectionHeader title="Send & Receive" subtitle="Lightning fast Bitcoin payments" />

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-secondary rounded-xl">
        {['send', 'receive'].map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all capitalize
              ${tab === t ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
          >
            {t === 'send' ? '↑ Send' : '↓ Receive'}
          </button>
        ))}
      </div>

      {tab === 'send'    && <SendPanel />}
      {tab === 'receive' && <ReceivePanel />}
    </div>
  )
}

/* ── Send ─────────────────────────────────────────── */
function SendPanel() {
  const { addTransaction, balance } = useWallet()
  const [invoice, setInvoice] = useState('')
  const [amount, setAmount] = useState('')
  const [sending, setSending] = useState(false)

  const handleSend = () => {
    const sats = parseInt(amount)
    if (!sats || sats <= 0) { toast.error('Enter a valid amount'); return }
    if (sats > balance)     { toast.error('Insufficient balance'); return }

    setSending(true)
    setTimeout(() => {
      addTransaction({
        type: 'send',
        description: invoice ? `Payment to ${invoice.slice(0, 16)}...` : 'Lightning payment',
        amount: sats,
        status: 'confirmed',
        channel: 'lightning',
      })
      setAmount('')
      setInvoice('')
      setSending(false)
      toast.success(`Sent ${sats.toLocaleString()} sats ⚡`)
    }, 1200)
  }

  return (
    <Card className="p-6 space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <Zap className="w-4 h-4 text-primary" />
        <span className="text-sm font-semibold text-foreground">Lightning Payment</span>
      </div>

      <Input
        label="Lightning Invoice"
        placeholder="lntb…"
        value={invoice}
        onChange={e => setInvoice(e.target.value)}
      />
      <Input
        label="Amount (sats)"
        type="number"
        placeholder="e.g. 5000"
        value={amount}
        onChange={e => setAmount(e.target.value)}
      />

      <div className="text-xs text-muted-foreground">
        Available: <span className="font-mono text-foreground">{balance.toLocaleString()} sats</span>
      </div>

      <Button
        className="w-full"
        onClick={handleSend}
        disabled={sending}
      >
        {sending ? 'Routing payment…' : '⚡ Pay Now'}
      </Button>

      {/* Quick amounts */}
      <div className="flex gap-2 flex-wrap">
        {[1000, 5000, 10000, 50000].map(n => (
          <button
            key={n}
            onClick={() => setAmount(String(n))}
            className="text-xs px-3 py-1.5 rounded-lg bg-secondary hover:bg-secondary/80 text-muted-foreground border border-border transition-colors"
          >
            {n.toLocaleString()} sats
          </button>
        ))}
      </div>
    </Card>
  )
}

/* ── Receive ──────────────────────────────────────── */
function ReceivePanel() {
  const { addTransaction } = useWallet()
  const [amount, setAmount]   = useState('')
  const [memo, setMemo]       = useState('')
  const [invoice, setInvoice] = useState(null)
  const [copied, setCopied]   = useState(false)
  const qrRef = useRef(null)

  useEffect(() => {
    if (invoice && qrRef.current) {
      drawQR(qrRef.current, invoice, 160)
    }
  }, [invoice])

  const generate = () => {
    const sats = parseInt(amount) || 0
    const inv   = generateInvoiceId()
    setInvoice(inv)
    addTransaction({
      type: 'receive',
      description: memo ? memo : `Invoice for ${sats} sats`,
      amount: sats,
      status: 'pending',
      channel: 'lightning',
    })
    toast.info('Invoice created — waiting for payment')
  }

  const copy = () => {
    if (!invoice) return
    navigator.clipboard?.writeText(invoice)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
    toast.success('Invoice copied!')
  }

  return (
    <Card className="p-6 space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <Zap className="w-4 h-4 text-green-400" />
        <span className="text-sm font-semibold text-foreground">Create Invoice</span>
      </div>

      <Input
        label="Amount (sats)"
        type="number"
        placeholder="e.g. 10000"
        value={amount}
        onChange={e => setAmount(e.target.value)}
      />
      <Input
        label="Memo (optional)"
        placeholder="What's this for?"
        value={memo}
        onChange={e => setMemo(e.target.value)}
      />

      <Button className="w-full" onClick={generate}>
        Generate Invoice
      </Button>

      {invoice && (
        <div className="space-y-4 pt-2 border-t border-border">
          {/* QR */}
          <div className="flex justify-center">
            <div className="bg-white rounded-xl p-3">
              <canvas ref={qrRef} width={160} height={160} />
            </div>
          </div>

          {/* Invoice string */}
          <div className="bg-background border border-border rounded-lg p-3 flex items-start gap-3">
            <code className="text-[11px] text-muted-foreground break-all flex-1 font-mono leading-relaxed">
              {invoice}
            </code>
            <button onClick={copy} className="flex-shrink-0 p-1 hover:text-foreground text-muted-foreground">
              {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>

          <div className="flex items-center gap-2 text-xs text-yellow-400">
            <div className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse" />
            Waiting for payment…
          </div>
        </div>
      )}
    </Card>
  )
}
