import { useState, useEffect } from 'react'
import { Routes, Route } from 'react-router-dom'
import { Toaster } from 'sonner'
import { supabase } from './lib/supabase'
import { WalletProvider } from './lib/wallet-store'
import Sidebar  from './components/Sidebar'
import Header   from './components/Header'
import Auth             from './pages/Auth'
import Dashboard        from './pages/Dashboard'
import Transact         from './pages/Transact'
import MerchantDashboard from './pages/MerchantDashboard'
import OfflineQueue     from './pages/OfflineQueue'
import USSDSimulator    from './pages/USSDSimulator'
import RelayNetwork     from './pages/RelayNetwork'
import WalletSettings   from './pages/WalletSettings'
import Profile          from './pages/Profile'

export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [session, setSession]         = useState(null)
  const [loading, setLoading]         = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setLoading(false)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })
    return () => subscription.unsubscribe()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-muted-foreground text-sm animate-pulse">Loading…</div>
      </div>
    )
  }

  if (!session) {
    return (
      <>
        <Auth />
        <Toaster position="bottom-right" theme="dark" richColors closeButton />
      </>
    )
  }

  return (
    <WalletProvider>
      <div className="min-h-screen bg-background font-sans">
        <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <div className="lg:ml-64 flex flex-col min-h-screen">
          <Header onMenuClick={() => setSidebarOpen(true)} />
          <main className="flex-1 p-4 lg:p-6">
            <Routes>
              <Route path="/"         element={<Dashboard />} />
              <Route path="/transact" element={<Transact />} />
              <Route path="/merchant" element={<MerchantDashboard />} />
              <Route path="/offline"  element={<OfflineQueue />} />
              <Route path="/ussd"     element={<USSDSimulator />} />
              <Route path="/relay"    element={<RelayNetwork />} />
              <Route path="/settings" element={<WalletSettings />} />
              <Route path="/profile"  element={<Profile />} />
            </Routes>
          </main>
        </div>
      </div>
      <Toaster position="bottom-right" theme="dark" richColors closeButton />
    </WalletProvider>
  )
}
