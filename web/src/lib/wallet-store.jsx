import { createContext, useContext, useState, useCallback } from 'react'

const WalletContext = createContext(null)

const INITIAL_TRANSACTIONS = [
  {
    id: 'tx_001',
    type: 'receive',
    description: 'Invoice for 5000 sats',
    amount: 5000,
    status: 'pending',
    date: new Date('2025-04-27T17:27:00'),
    channel: 'lightning',
  },
  {
    id: 'tx_002',
    type: 'receive',
    description: 'Invoice for 800 sats',
    amount: 800,
    status: 'pending',
    date: new Date('2025-04-27T17:34:00'),
    channel: 'lightning',
  },
]

const INITIAL_OFFLINE_QUEUE = [
  {
    id: 'off_001',
    description: 'Market stall payment',
    amount: 1200,
    recipient: 'MKT-LILONGWE-001',
    status: 'queued',
    method: 'sms',
    date: new Date('2025-04-27T16:00:00'),
  },
]

const INITIAL_RELAY_NODES = [
  { id: 'relay_001', name: 'Nkhotakota Node',  location: 'Lakeshore, Central', status: 'online',  txCount: 47, bleActive: true,  smsActive: true  },
  { id: 'relay_002', name: 'Ntchisi Node',     location: 'Rural, Central',     status: 'online',  txCount: 31, bleActive: true,  smsActive: true  },
  { id: 'relay_003', name: 'Mulanje Node',     location: 'Southern, Mountain', status: 'syncing', txCount: 12, bleActive: true,  smsActive: false },
]

export function WalletProvider({ children }) {
  const [balance, setBalance] = useState(0)           // sats
  const [transactions, setTransactions] = useState(INITIAL_TRANSACTIONS)
  const [offlineQueue, setOfflineQueue] = useState(INITIAL_OFFLINE_QUEUE)
  const [relayNodes] = useState(INITIAL_RELAY_NODES)
  const [channels] = useState([
    { id: 'ch_001', peer: 'ACINALA-NODE-001',   capacity: 200000, localBalance: 152000, status: 'active' },
    { id: 'ch_002', peer: 'BLANTYRE-HUB-007',   capacity: 100000, localBalance: 38300,  status: 'active' },
    { id: 'ch_003', peer: 'LILONGWE-GW-002',    capacity: 185000, localBalance: 13000,  status: 'active' },
  ])
  const [blockHeight, setBlockHeight] = useState(2509134)
  const [nodeAlias] = useState('chuma-pay-testnet')

  const totalSent     = transactions.filter(t => t.type === 'send').reduce((s, t) => s + t.amount, 0)
  const totalReceived = transactions.filter(t => t.type === 'receive').reduce((s, t) => s + t.amount, 0)

  const addTransaction = useCallback((tx) => {
    const newTx = { id: `tx_${Date.now()}`, date: new Date(), ...tx }
    setTransactions(prev => [newTx, ...prev])
    if (tx.type === 'receive') setBalance(b => b + tx.amount)
    if (tx.type === 'send')    setBalance(b => Math.max(0, b - tx.amount))
    return newTx
  }, [])

  const addToOfflineQueue = useCallback((item) => {
    const newItem = { id: `off_${Date.now()}`, date: new Date(), status: 'queued', ...item }
    setOfflineQueue(prev => [newItem, ...prev])
    return newItem
  }, [])

  const processOfflineItem = useCallback((id) => {
    setOfflineQueue(prev =>
      prev.map(item => item.id === id ? { ...item, status: 'processing' } : item)
    )
    setTimeout(() => {
      setOfflineQueue(prev =>
        prev.map(item => item.id === id ? { ...item, status: 'confirmed' } : item)
      )
    }, 2000)
  }, [])

  const mineBlock = useCallback(() => {
    setBlockHeight(h => h + 1)
  }, [])

  const addTestFunds = useCallback((amount = 100000) => {
    addTransaction({ type: 'receive', description: 'Testnet faucet', amount, status: 'confirmed', channel: 'onchain' })
  }, [addTransaction])

  return (
    <WalletContext.Provider value={{
      balance, transactions, offlineQueue, relayNodes, channels,
      blockHeight, nodeAlias,
      totalSent, totalReceived,
      addTransaction, addToOfflineQueue, processOfflineItem,
      mineBlock, addTestFunds,
    }}>
      {children}
    </WalletContext.Provider>
  )
}

export const useWallet = () => {
  const ctx = useContext(WalletContext)
  if (!ctx) throw new Error('useWallet must be used inside WalletProvider')
  return ctx
}
