import { useState, useRef, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Zap, Copy, Check, Link } from 'lucide-react'
import { useWallet } from '../lib/wallet-store'
import { generateInvoiceId, drawQR } from '../lib/utils'
import { Card, Button, Input, SectionHeader } from '../components/ui'
import { toast } from 'sonner'

const NETWORK_TABS = [
  { id: 'lightning', label: '⚡ Lightning', desc: 'Instant · Near-zero fees' },
  { id: 'onchain',   label: '₿ Onchain',   desc: 'Slower · Higher fees'     },
]

export default function Transact() {
  const [params] = useSearchParams()
  const [tab, setTab]       = useState(params.get('tab') || 'send')
  const [network, setNetwork] = useState('lightning')

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <SectionHeader title="Send & Receive" subtitle="Lightning fast Bitcoin payments" />

      {/* Send/Receive Tabs */}
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

      {/* Network Selection */}
      <div className="grid grid-cols-2 gap-3">
        {NETWORK_TABS.map(({ id, label, desc }) => (
          <button
            key={id}
            onClick={() => setNetwork(id)}
            className={`p-3 rounded-xl border text-left transition-all ${
              network === id
                ? 'border-primary bg-primary/10 text-primary'
                : 'border-border bg-secondary/30 text-muted-foreground hover:border-primary/50'
            }`}
          >
            <p className="text-sm font-semibold">{label}</p>
            <p className="text-xs mt-0.5 opacity-70">{desc}</p>
          </button>
        ))}
      </div>

      {/* Panel */}
      {tab === 'send'    && <SendPanel network={network} />}
      {tab === 'receive' && <ReceivePanel network={network} />}
    </div>
  )
}

/* ── Send ─────────────────────────────────────────── */
function SendPanel({ network }) {
  const { addTransaction, balance } = useWallet()
  const [invoice, setInvoice] = useState('')
  const [address, setAddress] = useState('')
  const [amount, setAmount]   = useState('')
  const [sending, setSending] = useState(false)

  const isLightning = network === 'lightning'

  const handleSend = () => {
    const sats = parseInt(amount)
    if (!sats || sats <= 0) { toast.error('Enter a valid amount'); return }
    if (sats > balance)     { toast.error('Insufficient balance'); return }

    if (isLightning && !invoice) { toast.error('Enter a Lightning invoice'); return }
    if (!isLightning && !address) { toast.error('Enter a Bitcoin address'); return }

    setSending(true)
    setTimeout(() => {
      addTransaction({
        type: 'send',
        description: isLightning
          ? `Lightning payment to ${invoice.slice(0, 16)}...`
          : `Onchain payment to ${address.slice(0, 16)}...`,
        amount: sats,
        status: 'confirmed',
        channel: isLightning ? 'lightning' : 'onchain',
      })
      setAmount('')
      setInvoice('')
      setAddress('')
      setSending(false)
      toast.success(`Sent ${sats.toLocaleString()} sats ${isLightning ? '⚡' : '₿'}`)
    }, 1200)
  }

  return (
    <Card className="p-6 space-y-4">
      <div className="flex items-center gap-2 mb-2">
        {isLightning
          ? <Zap className="w-4 h-4 text-primary" />
          : <Link className="w-4 h-4 text-orange-400" />
        }
        <span className="text-sm font-semibold text-foreground">
          {isLightning ? 'Lightning Payment' : 'Onchain Payment'}
        </span>
      </div>

      {isLightning ? (
        <Input
          label="Lightning Invoice"
          placeholder="lntb…"
          value={invoice}
          onChange={e => setInvoice(e.target.value)}
        />
      ) : (
        <Input
          label="Bitcoin Address"
          placeholder="bc1q… or tb1q… (testnet)"
          value={address}
          onChange={e => setAddress(e.target.value)}
        />
      )}

      <Input
        label="Amount (sats)"
        type="number"
        placeholder="e.g. 5000"
        value={amount}
        onChange={e => setAmount(e.target.value)}
      />

      {!isLightning && (
        <div className="p-3 rounded-lg bg-yellow-500/5 border border-yellow-500/20 text-xs text-yellow-400">
          ⚠️ Onchain transactions require network confirmations and may take 10-60 minutes.
        </div>
      )}

      <div className="text-xs text-muted-foreground">
        Available: <span className="font-mono text-foreground">{balance.toLocaleString()} sats</span>
      </div>

      <Button className="w-full" onClick={handleSend} disabled={sending}>
        {sending ? 'Broadcasting…' : isLightning ? '⚡ Pay Now' : '₿ Send Onchain'}
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
function ReceivePanel({ network }) {
  const { addTransaction } = useWallet()
  const [amount, setAmount]   = useState('')
  const [memo, setMemo]       = useState('')
  const [invoice, setInvoice] = useState(null)
  const [copied, setCopied]   = useState(false)
  const qrRef = useRef(null)

  const isLightning = network === 'lightning'

  // Testnet onchain address (placeholder)
  const TESTNET_ADDRESS = 'tb1qw508d6qejxtdg4y5r3zarvary0c5xw7kxpjzsx'

  useEffect(() => {
    if (invoice && qrRef.current) {
      const { drawQR } = require('../lib/utils')
      drawQR(qrRef.current, invoice, 160)
    }
  }, [invoice])

  const generate = () => {
    const sats = parseInt(amount) || 0
    const inv = isLightning ? generateInvoiceId() : TESTNET_ADDRESS
    setInvoice(inv)
    if (isLightning) {
      addTransaction({
        type: 'receive',
        description: memo ? memo : `Invoice for ${sats} sats`,
        amount: sats,
        status: 'pending',
        channel: 'lightning',
      })
      toast.info('Lightning invoice created — waiting for payment')
    } else {
      toast.info('Share your Bitcoin address to receive onchain payment')
    }
  }

  const copy = () => {
    if (!invoice) return
    navigator.clipboard?.writeText(invoice)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
    toast.success(isLightning ? 'Invoice copied!' : 'Address copied!')
  }

  return (
    <Card className="p-6 space-y-4">
      <div className="flex items-center gap-2 mb-2">
        {isLightning
          ? <Zap className="w-4 h-4 text-green-400" />
          : <Link className="w-4 h-4 text-orange-400" />
        }
        <span className="text-sm font-semibold text-foreground">
          {isLightning ? 'Create Lightning Invoice' : 'Receive Onchain'}
        </span>
      </div>

      {isLightning && (
        <>
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
        </>
      )}

      {!isLightning && (
        <div className="p-4 rounded-xl bg-orange-500/5 border border-orange-500/20">
          <p className="text-xs text-orange-400 font-semibold mb-1">₿ Your Bitcoin Testnet Address</p>
          <p className="text-xs font-mono text-muted-foreground break-all">{TESTNET_ADDRESS}</p>
        </div>
      )}

      <Button className="w-full" onClick={generate}>
        {isLightning ? 'Generate Invoice' : 'Show QR Code'}
      </Button>

      {invoice && (
        <div className="space-y-4 pt-2 border-t border-border">
          {/* QR */}
          <div className="flex justify-center">
            <div className="bg-white rounded-xl p-3">
              <canvas ref={qrRef} width={160} height={160} />
            </div>
          </div>

          {/* Invoice/Address string */}
          <div className="bg-background border border-border rounded-lg p-3 flex items-start gap-3">
            <code className="text-[11px] text-muted-foreground break-all flex-1 font-mono leading-relaxed">
              {invoice}
            </code>
            <button onClick={copy} className="flex-shrink-0 p-1 hover:text-foreground text-muted-foreground">
              {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>

          {isLightning && (
            <div className="flex items-center gap-2 text-xs text-yellow-400">
              <div className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse" />
              Waiting for payment…
            </div>
          )}

          {!isLightning && (
            <div className="flex items-center gap-2 text-xs text-orange-400">
              <div className="w-2 h-2 rounded-full bg-orange-400 animate-pulse" />
              Waiting for onchain confirmation…
            </div>
          )}
        </div>
      )}
    </Card>
  )
}
