import { useState, useEffect } from 'react'
import { Bitcoin, Copy, Check, RefreshCw, ExternalLink } from 'lucide-react'
import { secureGet, secureSet } from '../lib/secure-storage'
import { deriveTestnetAddress, getTestnetBalance, getTestnetTransactions, generateBIP39Mnemonic } from '../lib/bitcoin-wallet'
import { Card, Button, SectionHeader } from '../components/ui'
import { toast } from 'sonner'

export default function BitcoinWallet() {
  const [address, setAddress]           = useState(null)
  const [balance, setBalance]           = useState(null)
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading]           = useState(true)
  const [copied, setCopied]             = useState(false)
  const [refreshing, setRefreshing]     = useState(false)
  const [error, setError]               = useState(null)

  useEffect(() => {
    initWallet()
  }, [])

  const initWallet = async () => {
    setLoading(true)
    setError(null)
    try {
      let mnemonic = await secureGet('seed_phrase')
      if (!mnemonic) {
        mnemonic = generateBIP39Mnemonic()
        if (mnemonic) await secureSet('seed_phrase', mnemonic)
      }
      if (mnemonic) {
        const wallet = await deriveTestnetAddress(mnemonic)
        if (wallet) {
          setAddress(wallet.address)
          await loadBalance(wallet.address)
        } else {
          setError('Failed to derive address from seed phrase')
        }
      } else {
        setError('No seed phrase found. Generate one in Settings first.')
      }
    } catch (e) {
      setError(`Error: ${e.message}`)
    }
    setLoading(false)
  }

  const loadBalance = async (addr) => {
    const bal = await getTestnetBalance(addr)
    if (bal) setBalance(bal)
    const txs = await getTestnetTransactions(addr)
    setTransactions(txs)
  }

  const refresh = async () => {
    if (!address) return
    setRefreshing(true)
    await loadBalance(address)
    setRefreshing(false)
    toast.success('Balance refreshed!')
  }

  const copy = () => {
    navigator.clipboard?.writeText(address)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
    toast.success('Address copied!')
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <SectionHeader title="Bitcoin Wallet" subtitle="Real testnet onchain wallet" />

      <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-orange-500/10 border border-orange-500/20 text-orange-400 text-sm">
        ⚠️ Testnet only — no real Bitcoin involved
      </div>

      {loading ? (
        <Card className="p-8 text-center">
          <p className="text-muted-foreground animate-pulse">Deriving wallet from seed phrase…</p>
        </Card>
      ) : error ? (
        <Card className="p-8 text-center">
          <p className="text-red-400 text-sm">{error}</p>
          <Button className="mt-4" onClick={initWallet}>Try Again</Button>
        </Card>
      ) : (
        <>
          {/* Balance Card */}
          <Card className="p-6 bg-gradient-to-br from-orange-500/10 via-card to-card border-orange-500/20">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-orange-500/20 flex items-center justify-center">
                  <Bitcoin className="w-4 h-4 text-orange-400" />
                </div>
                <span className="text-sm font-medium text-muted-foreground">Onchain Balance</span>
              </div>
              <button onClick={refresh} className="p-2 rounded-md hover:bg-secondary text-muted-foreground">
                <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              </button>
            </div>
            <div className="space-y-1">
              <p className="text-3xl font-bold font-mono text-foreground">
                {balance ? `${(balance.total / 100_000_000).toFixed(8)} tBTC` : '0.00000000 tBTC'}
              </p>
              <p className="text-lg font-mono text-orange-400">
                {balance ? `${balance.total.toLocaleString()} sats` : '0 sats'}
              </p>
              {balance?.unconfirmed > 0 && (
                <p className="text-xs text-yellow-400">
                  + {balance.unconfirmed.toLocaleString()} sats unconfirmed
                </p>
              )}
            </div>
          </Card>

          {/* Address */}
          <Card className="p-5">
            <h3 className="text-sm font-semibold text-foreground mb-3">Your Testnet Address</h3>
            <div className="bg-background border border-border rounded-lg p-3 flex items-start gap-3">
              <code className="text-[11px] text-muted-foreground break-all flex-1 font-mono leading-relaxed">
                {address}
              </code>
              <button onClick={copy} className="flex-shrink-0 p-1 hover:text-foreground text-muted-foreground">
                {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
            <div className="flex gap-2 mt-3">
              <Button variant="outline" size="sm" className="flex-1"
                onClick={() => window.open(`https://blockstream.info/testnet/address/${address}`, '_blank')}>
                <ExternalLink className="w-3 h-3 mr-1" /> View on Explorer
              </Button>
              <Button variant="outline" size="sm" className="flex-1"
                onClick={() => window.open('https://bitcoinfaucet.uo1.net/', '_blank')}>
                🚰 Get Testnet BTC
              </Button>
            </div>
          </Card>

          {/* Transactions */}
          <Card className="p-5">
            <h3 className="text-sm font-semibold text-foreground mb-4">Onchain Transactions</h3>
            {transactions.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-sm text-muted-foreground">No transactions yet</p>
                <p className="text-xs text-muted-foreground mt-1">Use the faucet above to get free testnet BTC</p>
              </div>
            ) : (
              <div className="space-y-2">
                {transactions.slice(0, 10).map(tx => (
                  <div key={tx.id} className="flex items-center justify-between p-3 rounded-xl bg-secondary/30">
                    <div>
                      <p className="text-xs font-mono text-foreground">{tx.id.slice(0, 20)}…</p>
                      <p className="text-[11px] text-muted-foreground">
                        {tx.confirmed ? `Block ${tx.blockHeight}` : 'Unconfirmed'}
                      </p>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full ${tx.confirmed ? 'bg-green-500/10 text-green-400' : 'bg-yellow-500/10 text-yellow-400'}`}>
                      {tx.confirmed ? 'Confirmed' : 'Pending'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </>
      )}
    </div>
  )
}
