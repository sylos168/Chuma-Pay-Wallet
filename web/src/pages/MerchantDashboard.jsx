import { useState, useRef, useEffect } from 'react'
import { Store, Check } from 'lucide-react'
import { useWallet } from '../lib/wallet-store'
import { supabase } from '../lib/supabase'
import { generateInvoiceId, drawQR, formatDate } from '../lib/utils'
import { Card, Button, Input, SectionHeader } from '../components/ui'
import { toast } from 'sonner'

export default function MerchantDashboard() {
  const { addTransaction } = useWallet()
  const [amount, setAmount]           = useState('5000')
  const [desc, setDesc]               = useState('Market payment')
  const [invoice, setInvoice]         = useState(null)
  const [payStatus, setPayStatus]     = useState(null)
  const [sales, setSales]             = useState([])
  const [sevenDayTotal, setSevenDayTotal] = useState(0)
  const [loading, setLoading]         = useState(true)
  const qrRef = useRef(null)

  useEffect(() => {
    loadSales()
  }, [])

  const loadSales = async () => {
    setLoading(true)
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return

    const startOfDay = new Date()
    startOfDay.setHours(0, 0, 0, 0)

    const startOf7Days = new Date()
    startOf7Days.setDate(startOf7Days.getDate() - 7)
    startOf7Days.setHours(0, 0, 0, 0)

    // Today's sales
    const { data: todaySales } = await supabase
      .from('Transaction')
      .select('*')
      .eq('user_id', session.user.id)
      .eq('type', 'receive')
      .eq('channel', 'lightning')
      .gte('date', startOfDay.toISOString())
      .order('date', { ascending: false })

    // 7-day sales
    const { data: weekSales } = await supabase
      .from('Transaction')
      .select('amount')
      .eq('user_id', session.user.id)
      .eq('type', 'receive')
      .eq('channel', 'lightning')
      .gte('date', startOf7Days.toISOString())

    if (todaySales) setSales(todaySales)
    if (weekSales) setSevenDayTotal(weekSales.reduce((s, t) => s + t.amount, 0))
    setLoading(false)
  }

  const todayTotal = sales.reduce((s, x) => s + x.amount, 0)
  const avgTicket  = sales.length ? Math.round(todayTotal / sales.length) : 0

  useEffect(() => {
    if (invoice && qrRef.current) drawQR(qrRef.current, invoice, 120)
  }, [invoice])

  const createInvoice = () => {
    const sats = parseInt(amount)
    if (!sats || sats <= 0) { toast.error('Enter a valid amount'); return }
    const inv = generateInvoiceId()
    setInvoice(inv)
    setPayStatus('waiting')

    setTimeout(async () => {
      setPayStatus('paid')
      await addTransaction({
        type: 'receive',
        description: desc,
        amount: sats,
        status: 'confirmed',
        channel: 'lightning',
      })
      await loadSales()
      toast.success(`Payment received: ${sats.toLocaleString()} sats ⚡`)
    }, 3000)
  }

  const reset = () => { setInvoice(null); setPayStatus(null) }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <SectionHeader title="Merchant Dashboard" subtitle="Accept Lightning payments at your business" />

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: 'Today',        value: `${todayTotal.toLocaleString()} sats`,        color: 'text-primary'    },
          { label: 'Transactions', value: sales.length,                                  color: 'text-foreground' },
          { label: 'Avg. Ticket',  value: `${avgTicket.toLocaleString()} sats`,         color: 'text-foreground' },
          { label: '7-Day Total',  value: `${sevenDayTotal.toLocaleString()} sats`,     color: 'text-green-400'  },
        ].map(({ label, value, color }) => (
          <Card key={label} className="p-4">
            <p className="text-xs text-muted-foreground mb-1">{label}</p>
            <p className={`text-lg font-bold font-mono ${color}`}>{value}</p>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* POS Terminal */}
        <Card className="p-6 space-y-4">
          <div className="flex items-center gap-2">
            <Store className="w-4 h-4 text-primary" />
            <h3 className="font-semibold text-foreground">POS Terminal</h3>
          </div>
          <Input label="Amount (sats)" type="number" value={amount} onChange={e => setAmount(e.target.value)} />
          <Input label="Description"   value={desc}   onChange={e => setDesc(e.target.value)} />

          {!invoice && (
            <Button className="w-full" onClick={createInvoice}>⚡ Create Invoice</Button>
          )}

          {invoice && (
            <div className="space-y-3">
              {payStatus === 'waiting' && (
                <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 text-sm">
                  <div className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse" />
                  Awaiting payment — {parseInt(amount).toLocaleString()} sats
                </div>
              )}
              {payStatus === 'paid' && (
                <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400 text-sm">
                  <Check className="w-4 h-4" />
                  Payment confirmed! +{parseInt(amount).toLocaleString()} sats received
                </div>
              )}
              <div className="flex justify-center">
                <div className="bg-white rounded-xl p-3">
                  <canvas ref={qrRef} width={120} height={120} />
                </div>
              </div>
              <Button variant="outline" className="w-full" onClick={reset}>New Payment</Button>
            </div>
          )}
        </Card>

        {/* Real Sales */}
        <Card className="p-6">
          <h3 className="font-semibold text-foreground mb-4">Today's Sales</h3>
          {loading ? (
            <p className="text-sm text-muted-foreground text-center py-8 animate-pulse">Loading sales…</p>
          ) : sales.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">No sales yet today</p>
          ) : (
            <div className="space-y-2">
              {sales.map(sale => (
                <div key={sale.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                  <div>
                    <p className="text-sm text-foreground">{sale.description}</p>
                    <p className="text-xs text-muted-foreground">{formatDate(sale.date)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-mono font-semibold text-green-400">+{sale.amount.toLocaleString()}</p>
                    <p className="text-[10px] text-muted-foreground">sats</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* Onboarding Guide */}
      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="font-semibold text-foreground mb-3">🇬🇧 Merchant Guide</h3>
          <ol className="space-y-2 text-sm text-muted-foreground list-decimal list-inside">
            {['Download the Chuma Pay app','Create wallet — save your 12-word seed','Print your QR payment stand','Place QR at checkout counter','Customer scans → payment instant','Withdraw to M-Pesa or bank anytime'].map((step, i) => (
              <li key={i}>{step}</li>
            ))}
          </ol>
          <Button variant="outline" size="sm" className="mt-4">↓ Download PDF Guide</Button>
        </Card>
        <Card className="p-6">
          <h3 className="font-semibold text-foreground mb-3">🇲🇼 Malangizo (Chichewa)</h3>
          <ol className="space-y-2 text-sm text-muted-foreground list-decimal list-inside">
            {['Tsitsani app ya Chuma Pay','Pangani wallet — sunga mawu 12','Sinthani QR stand yanu','Ikani QR pa kaunta yanu','Kasitomala asanuje → ndalama msanga','Tulutsa ku M-Pesa nthawi iliyonse'].map((step, i) => (
              <li key={i}>{step}</li>
            ))}
          </ol>
          <Button variant="outline" size="sm" className="mt-4">↓ Tsitsani PDF</Button>
        </Card>
      </div>
    </div>
  )
}
