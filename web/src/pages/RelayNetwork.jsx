import { useState } from 'react'
import { Signal, Wifi, WifiOff, Bluetooth, MessageSquare } from 'lucide-react'
import { useWallet } from '../lib/wallet-store'
import { Card, Button, Badge, SectionHeader } from '../components/ui'
import { toast } from 'sonner'

export default function RelayNetwork() {
  const { relayNodes } = useWallet()
  const [bleScanning, setBleScanning] = useState(false)
  const [bleFound,    setBleFound]    = useState(false)
  const [smsSim,      setSmsSim]      = useState(null)

  const startBLE = () => {
    setBleScanning(true)
    setBleFound(false)
    toast.info('Scanning for BLE devices…')
    setTimeout(() => {
      setBleFound(true)
      setBleScanning(false)
      toast.success('BLE device found: ChumaPay-7F2A')
    }, 1500)
    setTimeout(() => {
      toast.success('BLE payment handshake complete — 800 sats sent offline ⚡')
    }, 3000)
  }

  const simulateSMS = () => {
    setSmsSim('sending')
    setTimeout(() => {
      setSmsSim('confirmed')
      toast.success('SMS relay confirmed — 1200 sats routed offline')
    }, 1500)
  }

  const statusVariant = (s) => ({ online: 'green', syncing: 'yellow', offline: 'red' }[s] || 'gray')

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <SectionHeader title="Relay Network" subtitle="Raspberry Pi nodes enabling offline Lightning payments via SMS + BLE" />

      {/* Node grid */}
      <div className="grid md:grid-cols-3 gap-4">
        {relayNodes.map(node => (
          <Card key={node.id} className="p-5">
            <div className="text-3xl mb-2">🍓</div>
            <h3 className="font-semibold text-foreground">{node.name}</h3>
            <p className="text-xs text-muted-foreground mb-3">{node.location}</p>
            <div className="flex flex-wrap gap-1.5 mb-3">
              <Badge variant={statusVariant(node.status)}>
                {node.status.charAt(0).toUpperCase() + node.status.slice(1)}
              </Badge>
              {node.bleActive  && <Badge variant="blue">BLE</Badge>}
              {node.smsActive  && <Badge variant="orange">SMS</Badge>}
              {!node.smsActive && <Badge variant="gray">SMS offline</Badge>}
            </div>
            <p className="text-xs font-mono text-muted-foreground">
              {node.txCount} txs processed
            </p>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* BLE simulator */}
        <Card className="p-5">
          <div className="flex items-center gap-2 mb-4">
            <Bluetooth className="w-4 h-4 text-blue-400" />
            <h3 className="font-semibold text-foreground">BLE Proximity Payment</h3>
          </div>

          <div className="text-center py-6">
            <div className="text-5xl mb-3">
              {!bleScanning && !bleFound && '📵'}
              {bleScanning  && '📡'}
              {bleFound     && '🔵'}
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              {!bleScanning && !bleFound && 'BLE inactive — press Start to scan'}
              {bleScanning  && 'Scanning for nearby devices…'}
              {bleFound     && 'Device found: ChumaPay-7F2A'}
            </p>
            <Button
              onClick={startBLE}
              disabled={bleScanning}
              variant={bleFound ? 'success' : 'outline'}
            >
              {bleScanning ? 'Scanning…' : bleFound ? 'Connected ✓' : 'Start BLE Scan'}
            </Button>
          </div>

          {/* Visual proximity dots */}
          <div className="relative h-24 bg-secondary rounded-xl overflow-hidden flex items-center justify-center gap-8">
            <div className={`w-10 h-10 rounded-full border-2 flex items-center justify-center text-xs font-mono transition-all duration-500
              ${bleFound ? 'border-green-500 bg-green-500/10 text-green-400' : 'border-border bg-secondary text-muted-foreground'}`}>
              You
            </div>
            <div className={`text-muted-foreground text-sm transition-opacity duration-500 ${bleScanning ? 'opacity-100 animate-pulse' : bleFound ? 'opacity-100' : 'opacity-20'}`}>
              ···
            </div>
            <div className={`w-10 h-10 rounded-full border-2 flex items-center justify-center text-xs font-mono transition-all duration-500
              ${bleFound ? 'border-blue-500 bg-blue-500/10 text-blue-400' : 'border-border bg-secondary text-muted-foreground'}`}>
              Peer
            </div>
          </div>
        </Card>

        {/* SMS simulator */}
        <Card className="p-5">
          <div className="flex items-center gap-2 mb-4">
            <MessageSquare className="w-4 h-4 text-orange-400" />
            <h3 className="font-semibold text-foreground">SMS Relay Simulator</h3>
          </div>

          <div className="space-y-2 mb-4">
            {/* Outbound */}
            <div className="bg-secondary rounded-xl rounded-br-sm p-3 font-mono text-[11px] text-muted-foreground leading-relaxed max-w-[90%]">
              PAY:lntb1200n1p...k7j9:FROM:265991234567:PIN:****:TO:MKT-001
            </div>
            {/* Inbound */}
            {smsSim === 'confirmed' && (
              <div className="bg-primary/10 border border-primary/20 rounded-xl rounded-bl-sm p-3 font-mono text-[11px] text-primary leading-relaxed max-w-[90%] ml-auto">
                ACK:OK:TXID:{Math.random().toString(16).substr(2,8).toUpperCase()}:BAL:202100:FEE:0
              </div>
            )}
            {smsSim === 'sending' && (
              <div className="text-xs text-muted-foreground animate-pulse ml-auto text-right">
                Relay node processing…
              </div>
            )}
          </div>

          <Button
            onClick={simulateSMS}
            disabled={smsSim === 'sending'}
            variant="outline"
            className="w-full"
          >
            {smsSim === 'sending' ? '⏳ Sending…' : smsSim === 'confirmed' ? '↺ Simulate Again' : '▶ Simulate SMS Payment'}
          </Button>

          <div className="mt-4 space-y-1 text-xs text-muted-foreground">
            <p className="font-semibold text-foreground text-[11px] uppercase tracking-wider mb-2">Protocol</p>
            <p><span className="text-foreground">PAY:</span> Invoice prefix</p>
            <p><span className="text-foreground">FROM:</span> Sender MSISDN (265…)</p>
            <p><span className="text-foreground">PIN:</span> 4-digit session PIN</p>
            <p><span className="text-foreground">TO:</span> Merchant ID or phone</p>
            <p><span className="text-foreground">ACK:</span> Confirmation + TXID</p>
          </div>
        </Card>
      </div>

      {/* Node deployment info */}
      <Card className="p-5">
        <h3 className="font-semibold text-foreground mb-3">Raspberry Pi Node Specs</h3>
        <div className="grid sm:grid-cols-3 gap-4 text-sm">
          {[
            { label: 'Hardware',    value: 'Raspberry Pi 4 (2GB RAM)' },
            { label: 'Storage',     value: '64GB SD + Bitcoin Testnet' },
            { label: 'Connectivity', value: 'SIM card (Airtel/TNM) + BLE 5.0' },
            { label: 'Power',       value: 'Solar + battery backup' },
            { label: 'Software',    value: 'LND + custom relay daemon' },
            { label: 'Range',       value: 'BLE: ~10m · SMS: national' },
          ].map(({ label, value }) => (
            <div key={label} className="p-3 bg-secondary rounded-lg">
              <p className="text-xs text-muted-foreground mb-1">{label}</p>
              <p className="text-sm font-medium text-foreground">{value}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
