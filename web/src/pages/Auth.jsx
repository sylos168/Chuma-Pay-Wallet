import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { Card, Button, Input, SectionHeader } from '../components/ui'
import { toast } from 'sonner'
import { Zap } from 'lucide-react'

export default function Auth() {
  const [tab, setTab] = useState('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    if (!email || !password) { toast.error('Fill in all fields'); return }
    setLoading(true)
    if (tab === 'login') {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) toast.error(error.message)
      else toast.success('Welcome back!')
    } else {
      const { error } = await supabase.auth.signUp({ email, password })
      if (error) toast.error(error.message)
      else toast.success('Account created! Check your email.')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="flex flex-col items-center gap-2">
          <div className="w-12 h-12 rounded-2xl bg-primary/20 flex items-center justify-center">
            <Zap className="w-6 h-6 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Chuma Pay</h1>
          <p className="text-sm text-muted-foreground">Bitcoin Lightning Wallet</p>
        </div>

        <Card className="p-6 space-y-4">
          <div className="flex gap-1 p-1 bg-secondary rounded-xl">
            {['login', 'signup'].map(t => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all capitalize
                  ${tab === t ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
              >
                {t === 'login' ? 'Login' : 'Sign Up'}
              </button>
            ))}
          </div>

          <Input
            label="Email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={e => setEmail(e.target.value)}
          />
          <Input
            label="Password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={e => setPassword(e.target.value)}
          />

          <Button className="w-full" onClick={handleSubmit} disabled={loading}>
            {loading ? 'Please wait…' : tab === 'login' ? 'Login' : 'Create Account'}
          </Button>
        </Card>
      </div>
    </div>
  )
}
