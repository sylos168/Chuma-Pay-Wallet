import { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { supabase } from './supabase'

const WalletContext = createContext(null)

const INITIAL_RELAY_NODES = [
  { id: 'relay_001', name: 'Nkhotakota Node',  location: 'Lakeshore, Central', status: 'online',  txCount: 47, bleActive: true,  smsActive: true  },
  { id: 'relay_002', name: 'Ntchisi Node',     location: 'Rural, Central',     status: 'online',  txCount: 31, bleActive: true,  smsActive: true  },
  { id: 'relay_003', name: 'Mulanje Node',     location: 'Southern, Mountain', status: 'syncing', txCount: 12, bleActive: true,  smsActive: false },
]

export function WalletProvider({ children }) {
  const [balance, setBalance]           = useState(0)
  const [transactions, setTransactions] = useState([])
  const [offlineQueue, setOfflineQueue] = useState([])
  const [relayNodes]                    = useState(INITIAL_RELAY_NODES)
  const [channels]                      = useState([
    { id: 'ch_001', peer: 'ACINALA-NODE-001',   capacity: 200000, localBalance: 152000, status: 'active' },
    { id: 'ch_002', peer: 'BLANTYRE-HUB-007',   capacity: 100000, localBalance: 38300,  status: 'active' },
    { id: 'ch_003', peer: 'LILONGWE-GW-002',    capacity: 185000, localBalance: 13000,  status: 'active' },
  ])
  const [blockHeight, setBlockHeight] = useState(2509134)
  const [nodeAlias]                   = useState('chuma-pay-testnet')
  const [userId, setUserId]           = useState(null)

  // ── Load user + data on mount ──────────────────────────────
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) return
      const uid = session.user.id
      setUserId(uid)
      loadWallet(uid)
      loadTransactions(uid)
      loadOfflineQueue(uid)
      subscribeToChanges(uid)
    })

    return () => {
      supabase.channel('wallet-changes').unsubscribe()
    }
  }, [])

  // ── Real-time subscriptions ────────────────────────────────
  const subscribeToChanges = (uid) => {
    supabase
      .channel('wallet-changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'Transaction',
        filter: `user_id=eq.${uid}`,
      }, () => {
        loadTransactions(uid)
      })
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'Wallet',
        filter: `user_id=eq.${uid}`,
      }, (payload) => {
        if (payload.new?.balance !== undefined) {
          setBalance(payload.new.balance)
        }
      })
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'OfflineTransaction',
        filter: `user_id=eq.${uid}`,
      }, () => {
        loadOfflineQueue(uid)
      })
      .subscribe()
  }

  const loadWallet = async (uid) => {
    const { data } = await supabase
      .from('Wallet')
      .select('*')
      .eq('user_id', uid)
      .single()

    if (data) {
      setBalance(data.balance)
      setBlockHeight(data.block_height || 2509134)
    } else {
      await supabase.from('Wallet').insert({
        user_id: uid,
        balance: 0,
        node_alias: 'chuma-pay-testnet',
        block_height: 2509134,
      })
    }
  }

  const loadTransactions = async (uid) => {
    const { data } = await supabase
      .from('Transaction')
      .select('*')
      .eq('user_id', uid)
      .order('date', { ascending: false })
    if (data) setTransactions(data)
  }

  const loadOfflineQueue = async (uid) => {
    const { data } = await supabase
      .from('OfflineTransaction')
      .select('*')
      .eq('user_id', uid)
      .order('date', { ascending: false })
    if (data) setOfflineQueue(data)
  }

  const updateBalance = async (uid, newBalance) => {
    await supabase
      .from('Wallet')
      .update({ balance: newBalance })
      .eq('user_id', uid)
  }

  const addTransaction = useCallback(async (tx) => {
    const uid = userId || (await supabase.auth.getSession()).data.session?.user.id
    if (!uid) return

    const newTx = {
      id: `tx_${Date.now()}`,
      user_id: uid,
      date: new Date().toISOString(),
      ...tx,
    }

    const { data } = await supabase.from('Transaction').insert(newTx).select().single()

    if (data) {
      setTransactions(prev => [data, ...prev])
      setBalance(b => {
        const newBalance = tx.type === 'receive'
          ? b + tx.amount
          : Math.max(0, b - tx.amount)
        updateBalance(uid, newBalance)
        return newBalance
      })
    }
    return data
  }, [userId])

  const addToOfflineQueue = useCallback(async (item) => {
    const uid = userId || (await supabase.auth.getSession()).data.session?.user.id
    if (!uid) return

    const newItem = {
      id: `off_${Date.now()}`,
      user_id: uid,
      date: new Date().toISOString(),
      status: 'queued',
      ...item,
    }

    const { data } = await supabase.from('OfflineTransaction').insert(newItem).select().single()
    if (data) setOfflineQueue(prev => [data, ...prev])
    return data
  }, [userId])

  const processOfflineItem = useCallback(async (id) => {
    setOfflineQueue(prev =>
      prev.map(item => item.id === id ? { ...item, status: 'processing' } : item)
    )
    await supabase.from('OfflineTransaction').update({ status: 'processing' }).eq('id', id)

    setTimeout(async () => {
      setOfflineQueue(prev =>
        prev.map(item => item.id === id ? { ...item, status: 'confirmed' } : item)
      )
      await supabase.from('OfflineTransaction').update({ status: 'confirmed' }).eq('id', id)
    }, 2000)
  }, [])

  const mineBlock = useCallback(() => {
    setBlockHeight(h => h + 1)
  }, [])

  const addTestFunds = useCallback((amount = 100000) => {
    addTransaction({
      type: 'receive',
      description: 'Testnet faucet',
      amount,
      status: 'confirmed',
      channel: 'onchain',
    })
  }, [addTransaction])

  const totalSent     = transactions.filter(t => t.type === 'send').reduce((s, t) => s + t.amount, 0)
  const totalReceived = transactions.filter(t => t.type === 'receive').reduce((s, t) => s + t.amount, 0)

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
