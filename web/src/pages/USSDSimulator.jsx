import { useState } from 'react'
import { Terminal } from 'lucide-react'
import { useWallet } from '../lib/wallet-store'
import { Card, Button, SectionHeader } from '../components/ui'

/* ── Menu tree ─────────────────────────────────────── */
const MENUS = {
  main: {
    en: { title: 'ZambeziBTC *483#', items: ['1. Send Money', '2. Receive (Invoice)', '3. Check Balance', '4. Buy Airtime', '5. Settings', '0. Exit'] },
    ny: { title: 'ZambeziBTC *483#', items: ['1. Tumizani Ndalama', '2. Landilani Ndalama', '3. Onani Bakha', '4. Gulani Airtime', '5. Zikhazikiko', '0. Tuluka'] },
  },
  balance: {
    en: { title: 'Your Balance', items: ['LN: -- sats', 'Chain: -- sats', '≈ MWK estimating...', '', '0. Back'] },
    ny: { title: 'Bakha Lanu',  items: ['LN: -- sats', 'Chain: -- sats', '≈ MWK kukwezeretsa...', '', '0. Bwerani'] },
  },
  send: {
    en: { title: 'Send Money', items: ['Enter recipient phone number:', '(type and press Send)', '', '', '0. Back'] },
    ny: { title: 'Tumizani Ndalama', items: ['Lowetsani nambala ya foni:', '(lowetsani ndikutimizia)', '', '', '0. Bwerani'] },
  },
  receive: {
    en: { title: 'Create Invoice', items: ['Enter amount in sats:', '(type and press Send)', '', '', '0. Back'] },
    ny: { title: 'Pangani Invoice', items: ['Lowetsani ndalama mu sats:', '(lowetsani ndikutimizia)', '', '', '0. Bwerani'] },
  },
  airtime: {
    en: { title: 'Buy Airtime', items: ['1. MWK 500 (Airtel)', '2. MWK 1000 (Airtel)', '3. MWK 500 (TNM)', '4. MWK 1000 (TNM)', '0. Back'] },
    ny: { title: 'Gulani Airtime', items: ['1. MWK 500 (Airtel)', '2. MWK 1000 (Airtel)', '3. MWK 500 (TNM)', '4. MWK 1000 (TNM)', '0. Bwerani'] },
  },
}

const ROUTES = {
  main:    { '1': 'send', '2': 'receive', '3': 'balance', '4': 'airtime', '5': 'main', '0': 'main' },
  balance: { '0': 'main' },
  send:    { '0': 'main' },
  receive: { '0': 'main' },
  airtime: { '0': 'main' },
}

export default function USSDSimulator() {
  const { balance } = useWallet()
  const [lang, setLang]    = useState('en')
  const [state, setState]  = useState('main')
  const [input, setInput]  = useState('')
  const [history, setHistory] = useState([])

  const currentMenu = MENUS[state]?.[lang] || MENUS.main.en

  // Inject real balance into balance screen
  const menuItems = state === 'balance'
    ? currentMenu.items.map(item =>
        item.startsWith('LN:') ? `LN: ${balance.toLocaleString()} sats` : item
      )
    : currentMenu.items

  const sendInput = () => {
    const val = input.trim()
    if (!val) return
    setHistory(h => [...h, { dir: 'out', text: val }])
    const next = ROUTES[state]?.[val]
    if (next) {
      setState(next)
      setHistory(h => [...h, { dir: 'in', text: `→ ${MENUS[next]?.[lang]?.title || next}` }])
    } else {
      setHistory(h => [...h, { dir: 'in', text: lang === 'ny' ? 'Zolakwika. Yesaninso.' : 'Invalid option. Try again.' }])
    }
    setInput('')
  }

  const pressKey = (k) => setInput(v => v + k)
  const reset    = () => { setState('main'); setInput(''); setHistory([]) }

  const LANG_PHRASES = {
    en: ['Send Money', 'Check Balance', 'Buy Airtime', 'Powered by Bitcoin Lightning'],
    ny: ['Tumizani Ndalama', 'Onani Bakha', 'Gulani Airtime', 'Nthambi ya Bitcoin Lightning'],
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <SectionHeader title="USSD Simulator" subtitle="Africa's Talking gateway — works on any phone, no internet needed" />

      <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-green-500/10 border border-green-500/20 text-green-400 text-sm">
        🇲🇼 Chichewa language support enabled — Ndalandila Chichewa!
      </div>

      <div className="flex gap-8 flex-wrap">
        {/* Phone mockup */}
        <div className="flex-shrink-0">
          <div className="w-56 bg-secondary rounded-3xl p-4 border-4 border-border shadow-2xl">
            {/* Screen */}
            <div className="bg-[#0d1a0d] rounded-xl p-3 min-h-[200px] mb-3 border-2 border-[#1a3a1a]">
              <div className="text-[#86efac] font-mono text-xs font-bold mb-2 pb-2 border-b border-[#2d4a2d]">
                {currentMenu.title}
              </div>
              <div className="space-y-1">
                {menuItems.map((item, i) => (
                  <div key={i} className="text-[#4ade80] font-mono text-[11px]">{item}</div>
                ))}
              </div>

              {/* History log */}
              {history.slice(-3).map((h, i) => (
                <div key={i} className={`font-mono text-[10px] mt-1 ${h.dir === 'out' ? 'text-[#fbbf24]' : 'text-[#86efac]'}`}>
                  {h.text}
                </div>
              ))}
            </div>

            {/* Input row */}
            <div className="flex gap-1.5 mb-3">
              <input
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && sendInput()}
                placeholder="Enter option..."
                className="flex-1 bg-[#0d1a0d] border border-[#2d4a2d] rounded px-2 py-1.5 text-[#4ade80] font-mono text-[11px] outline-none"
              />
              <button
                onClick={sendInput}
                className="bg-[#1a3a1a] border border-[#2d4a2d] text-[#86efac] px-2 py-1.5 rounded text-[11px] hover:bg-[#2d4a2d] transition-colors"
              >
                Send
              </button>
            </div>

            {/* Keypad */}
            <div className="grid grid-cols-3 gap-1.5">
              {['1','2','3','4','5','6','7','8','9','*','0','#'].map(k => (
                <button
                  key={k}
                  onClick={() => pressKey(k)}
                  className="bg-secondary rounded-lg py-2 text-sm font-mono text-muted-foreground hover:bg-border hover:text-foreground transition-all active:scale-95"
                >
                  {k}
                </button>
              ))}
            </div>
          </div>

          <Button variant="outline" size="sm" className="w-56 mt-3" onClick={reset}>
            Reset Session
          </Button>
        </div>

        {/* Config panel */}
        <div className="flex-1 min-w-[200px] space-y-4">
          <Card className="p-5">
            <h3 className="text-sm font-semibold text-foreground mb-3">Africa's Talking Config</h3>
            <dl className="space-y-2 font-mono text-xs">
              {[
                ['Service Code', '*483#'],
                ['Gateway',      'api.africastalking.com'],
                ['Networks',     'Airtel MW, TNM'],
                ['Sessions/hr',  '~1,200'],
                ['PIN Length',   '4 digits'],
                ['Session TTL',  '90 seconds'],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between">
                  <span className="text-muted-foreground">{k}</span>
                  <span className="text-foreground">{v}</span>
                </div>
              ))}
            </dl>
          </Card>

          <Card className="p-5">
            <h3 className="text-sm font-semibold text-foreground mb-3">Language</h3>
            <div className="flex gap-2 mb-4">
              <Button
                variant={lang === 'en' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setLang('en')}
              >
                English
              </Button>
              <Button
                variant={lang === 'ny' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setLang('ny')}
              >
                Chichewa
              </Button>
            </div>
            <div className="space-y-1">
              {LANG_PHRASES[lang].map(phrase => (
                <div key={phrase} className="text-xs text-muted-foreground">→ {phrase}</div>
              ))}
            </div>
          </Card>

          {/* SMS examples */}
          <Card className="p-5">
            <h3 className="text-sm font-semibold text-foreground mb-3">SMS Encoding Protocol</h3>
            <div className="space-y-2">
              <div className="bg-secondary rounded-lg p-3 font-mono text-[11px] text-muted-foreground leading-relaxed">
                PAY:lntb1500n1p...k7j9:FROM:265991234567:PIN:7842:TO:MKT-001
              </div>
              <div className="bg-primary/5 border border-primary/20 rounded-lg p-3 font-mono text-[11px] text-primary leading-relaxed">
                ACK:OK:TXID:a3f8c2:BAL:201800:FEE:0
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
