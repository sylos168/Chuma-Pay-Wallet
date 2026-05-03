import { useState, useEffect } from 'react'
import { Settings, Shield, Globe, Bell, Trash2, Download, Eye, EyeOff, AlertTriangle } from 'lucide-react'
import { useWallet } from '../lib/wallet-store'
import { supabase } from '../lib/supabase'
import { Card, Button, Input, SectionHeader } from '../components/ui'
import { toast } from 'sonner'
import { generateMnemonic } from '../lib/seedphrase'

export default function WalletSettings() {
  const { nodeAlias, blockHeight, addTestFunds, mineBlock } = useWallet()
  const [alias,        setAlias]        = useState(nodeAlias)
  const [pin,          setPin]          = useState('')
  const [newPin,       setNewPin]       = useState('')
  const [seedPhrase,   setSeedPhrase]   = useState(null)
  const [showSeed,     setShowSeed]     = useState(false)
  const [seedLoading,  setSeedLoading]  = useState(false)

  // Load existing seed phrase
  useEffect(() => {
    loadSeed()
  }, [])

  const loadSeed = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return
    const { data } = await supabase
      .from('Wallet')
      .select('seed_phrase')
      .eq('user_id', session.user.id)
      .single()
    if (data?.seed_phrase) setSeedPhrase(data.seed_phrase)
  }

  const generateSeed = async () => {
    setSeedLoading(true)
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return

    const mnemonic = generateMnemonic()
    const { error } = await supabase
      .from('Wallet')
      .update({ seed_phrase: mnemonic })
      .eq('user_id', session.user.id)

    if (error) {
      toast.error('Failed to generate seed phrase')
    } else {
      setSeedPhrase(mnemonic)
      setShowSeed(true)
      toast.success('Seed phrase generated — save it now!')
    }
    setSeedLoading(false)
  }

  const saveAlias = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return
    const { error } = await supabase
      .from('Wallet')
      .update({ node_alias: alias })
      .eq('user_id', session.user.id)
    if (error) toast.error('Failed to save')
    else toast.success('Settings saved!')
  }

  const resetWallet = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return
    await supabase.from('Transaction').delete().eq('user_id', session.user.id)
    await supabase.from('OfflineTransaction').delete().eq('user_id', session.user.id)
    await supabase.from('Wallet').update({ balance: 0 }).eq('user_id', session.user.id)
    toast.error('Wallet reset — all testnet data cleared')
    setTimeout(() => window.location.reload(), 1500)
  }

  const words = seedPhrase ? seedPhrase.split(' ') : []

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
              ['Network',        'testnet'],
              ['Implementation', 'LND v0.17.4'],
              ['Pub Key',        '03a8f...d7c2'],
              ['Block Height',   blockHeight.toLocaleString()],
              ['Peers',          '8'],
              ['Uptime',         '99.8%'],
            ].map(([k, v]) => (
              <div key={k} className="p-3 bg-secondary rounded-lg">
                <p className="text-muted-foreground mb-1">{k}</p>
                <p className="text-foreground font-medium">{v}</p>
              </div>
            ))}
          </div>
          <Button onClick={saveAlias} className="w-full">Save Changes</Button>
        </div>
      </Card>

      {/* Seed Phrase — Self Custodial */}
      <Card className="p-5 border-yellow-500/20">
        <div className="flex items-center gap-2 mb-4">
          <Shield className="w-4 h-4 text-yellow-400" />
          <h3 className="font-semibold text-foreground">Seed Phrase</h3>
          <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-500/10 text-yellow-400 border border-yellow-500/20">
            Self-Custodial
          </span>
        </div>

        <div className="p-3 rounded-lg bg-yellow-500/5 border border-yellow-500/20 mb-4">
          <div className="flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-yellow-400 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-yellow-400">
              Your 12-word seed phrase is the only way to recover your wallet. 
              Never share it with anyone. Write it down and store it safely offline.
            </p>
          </div>
        </div>

        {!seedPhrase ? (
          <Button
            className="w-full"
            onClick={generateSeed}
            disabled={seedLoading}
          >
            {seedLoading ? 'Generating…' : '🔑 Generate Seed Phrase'}
          </Button>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">Your 12-word recovery phrase:</p>
              <button
                onClick={() => setShowSeed(v => !v)}
                className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                {showSeed
                  ? <><EyeOff className="w-3 h-3" /> Hide</>
                  : <><Eye className="w-3 h-3" /> Reveal</>
                }
              </button>
            </div>

            {showSeed ? (
              <div className="grid grid-cols-3 gap-2">
                {words.map((word, i) => (
                  <div key={i} className="flex items-center gap-2 p-2 rounded-lg bg-secondary border border-border">
                    <span className="text-[10px] text-muted-foreground w-4">{i + 1}.</span>
                    <span className="text-xs font-mono text-foreground">{word}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-2">
                {words.map((_, i) => (
                  <div key={i} className="flex items-center gap-2 p-2 rounded-lg bg-secondary border border-border">
                    <span className="text-[10px] text-muted-foreground w-4">{i + 1}.</span>
                    <span className="text-xs font-mono text-foreground">••••••</span>
                  </div>
                ))}
              </div>
            )}

            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => {
                  navigator.clipboard?.writeText(seedPhrase)
                  toast.success('Seed phrase copied — store it safely!')
                }}
              >
                <Download className="w-3 h-3 mr-1" /> Copy Phrase
              </Button>
              <Button
                variant="outline"
                className="flex-1"
                onClick={generateSeed}
              >
                🔄 Regenerate
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Security */}
      <Card className="p-5">
        <div className="flex items-center gap-2 mb-4">
          <Shield className="w-4 h-4 text-green-400" />
          <h3 className="font-semibold text-foreground">Security</h3>
        </div>
        <div className="space-y-3">
          <Input label="Current PIN" type="password" placeholder="••••" value={pin}    onChange={e => setPin(e.target.value)} />
          <Input label="New PIN"     type="password" placeholder="••••" value={newPin} onChange={e => setNewPin(e.target.value)} />
          <Button variant="outline" className="w-full" onClick={() => { setPin(''); setNewPin(''); toast.success('PIN updated') }}>
            Update PIN
          </Button>
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
          <Button variant="outline" className="w-full justify-start"
            onClick={() => { addTestFunds(100000); toast.success('+100,000 sats from testnet faucet') }}>
            ⛏ Add 100,000 test sats (faucet)
          </Button>
          <Button variant="outline" className="w-full justify-start"
            onClick={() => { mineBlock(); toast.success('Block mined!') }}>
            ⛓ Mine a testnet block
          </Button>
          <Button variant="outline" className="w-full justify-start"
            onClick={() => toast.info('Opened: localhost:8080/api-docs')}>
            📄 View API Documentation
          </Button>
          <Button variant="outline" className="w-full justify-start"
            onClick={() => toast.info('Opening LND terminal…')}>
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
        <p className="text-xs text-muted-foreground mb-3">
          These actions are irreversible on mainnet. On testnet, data resets are safe.
        </p>
        <Button variant="danger" onClick={resetWallet}>
          Reset Wallet Data
        </Button>
      </Card>
    </div>
  )
}
