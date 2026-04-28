import { useState } from 'react'
import { Settings, Shield, Globe, Bell, Trash2, Download } from 'lucide-react'
import { useWallet } from '../lib/wallet-store'
import { Card, Button, Input, SectionHeader } from '../components/ui'
import { toast } from 'sonner'

export default function WalletSettings() {
  const { nodeAlias, blockHeight, addTestFunds, mineBlock } = useWallet()
  const [alias,   setAlias]   = useState(nodeAlias)
  const [pin,     setPin]     = useState('')
  const [newPin,  setNewPin]  = useState('')

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <SectionHeader title="Settings" subtitle="Configure your Chuma Pay wallet" />

      {/* Node Info */}
      <Card className="p-5">
        <div className="flex items-center gap-2 mb-4">
          <Settings className="w-4 h-4 text-primary" />
          <h3 className="font-semibold text-foreground">Node Configuration</h3>
        </div>
        <div className="space-y-3">
          <Input label="Node Alias" value={alias} onChange={e => setAlias(e.target.value)} />
          <div className="grid grid-cols-2 gap-3 text-xs font-mono">
            {[
              ['Network',     'testnet'],
              ['Implementation', 'LND v0.17.4'],
              ['Pub Key',     '03a8f...d7c2'],
              ['Block Height', blockHeight.toLocaleString()],
              ['Peers',       '8'],
              ['Uptime',      '99.8%'],
            ].map(([k, v]) => (
              <div key={k} className="p-3 bg-secondary rounded-lg">
                <p className="text-muted-foreground mb-1">{k}</p>
                <p className="text-foreground font-medium">{v}</p>
              </div>
            ))}
          </div>
          <Button onClick={() => toast.success('Settings saved')} className="w-full">Save Changes</Button>
        </div>
      </Card>

      {/* Security */}
      <Card className="p-5">
        <div className="flex items-center gap-2 mb-4">
          <Shield className="w-4 h-4 text-green-400" />
          <h3 className="font-semibold text-foreground">Security</h3>
        </div>
        <div className="space-y-3">
          <Input label="Current PIN" type="password" placeholder="••••" value={pin} onChange={e => setPin(e.target.value)} />
          <Input label="New PIN"     type="password" placeholder="••••" value={newPin} onChange={e => setNewPin(e.target.value)} />
          <Button variant="outline" className="w-full" onClick={() => { setPin(''); setNewPin(''); toast.success('PIN updated') }}>
            Update PIN
          </Button>
          <div className="p-3 bg-yellow-500/5 border border-yellow-500/20 rounded-lg">
            <p className="text-xs font-semibold text-yellow-400 mb-1">Backup Seed Phrase</p>
            <p className="text-xs text-muted-foreground">Your 12-word recovery phrase is the only way to restore your wallet. Keep it safe and never share it.</p>
            <Button variant="outline" size="sm" className="mt-2">
              <Download className="w-3 h-3" /> Export Seed (encrypted)
            </Button>
          </div>
        </div>
      </Card>

      {/* Language */}
      <Card className="p-5">
        <div className="flex items-center gap-2 mb-4">
          <Globe className="w-4 h-4 text-blue-400" />
          <h3 className="font-semibold text-foreground">Language & Region</h3>
        </div>
        <div className="flex gap-2">
          {[['en', '🇬🇧 English'], ['ny', '🇲🇼 Chichewa']].map(([code, label]) => (
            <button
              key={code}
              className="px-4 py-2 rounded-lg border border-border text-sm font-medium hover:bg-secondary transition-colors text-foreground"
              onClick={() => toast.success(`Language set to ${label}`)}
            >
              {label}
            </button>
          ))}
        </div>
      </Card>

      {/* Testnet tools */}
      <Card className="p-5">
        <div className="flex items-center gap-2 mb-4">
          <Bell className="w-4 h-4 text-orange-400" />
          <h3 className="font-semibold text-foreground">Testnet Developer Tools</h3>
        </div>
        <div className="space-y-2">
          <Button variant="outline" className="w-full justify-start" onClick={() => { addTestFunds(100000); toast.success('+100,000 sats from testnet faucet') }}>
            ⛏ Add 100,000 test sats (faucet)
          </Button>
          <Button variant="outline" className="w-full justify-start" onClick={() => { mineBlock(); toast.success('Block mined!') }}>
            ⛓ Mine a testnet block
          </Button>
          <Button variant="outline" className="w-full justify-start" onClick={() => toast.info('Opened: localhost:8080/api-docs')}>
            📄 View API Documentation
          </Button>
          <Button variant="outline" className="w-full justify-start" onClick={() => toast.info('Opening LND terminal…')}>
            💻 LND CLI Terminal
          </Button>
        </div>
      </Card>

      {/* Danger zone */}
      <Card className="p-5 border-red-500/20">
        <div className="flex items-center gap-2 mb-4">
          <Trash2 className="w-4 h-4 text-red-400" />
          <h3 className="font-semibold text-red-400">Danger Zone</h3>
        </div>
        <p className="text-xs text-muted-foreground mb-3">These actions are irreversible on mainnet. On testnet, data resets are safe.</p>
        <Button variant="danger" onClick={() => toast.error('Wallet reset — reconnect to testnet node')}>
          Reset Wallet Data
        </Button>
      </Card>
    </div>
  )
}
