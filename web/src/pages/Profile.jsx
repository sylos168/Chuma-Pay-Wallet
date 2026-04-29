import { useState, useEffect } from 'react'
import { User, Mail, Lock, Shield } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { Card, Button, Input, SectionHeader } from '../components/ui'
import { toast } from 'sonner'

export default function Profile() {
  const [email, setEmail]       = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPass, setConfirmPass] = useState('')
  const [loading, setLoading]   = useState(false)
  const [joinedAt, setJoinedAt] = useState('')

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) return
      setEmail(session.user.email)
      setJoinedAt(new Date(session.user.created_at).toLocaleDateString('en-GB', {
        year: 'numeric', month: 'long', day: 'numeric'
      }))
    })
  }, [])

  const updatePassword = async () => {
    if (!newPassword || !confirmPass) { toast.error('Fill in both password fields'); return }
    if (newPassword !== confirmPass)  { toast.error('Passwords do not match'); return }
    if (newPassword.length < 6)       { toast.error('Password must be at least 6 characters'); return }

    setLoading(true)
    const { error } = await supabase.auth.updateUser({ password: newPassword })
    if (error) toast.error(error.message)
    else {
      toast.success('Password updated successfully!')
      setNewPassword('')
      setConfirmPass('')
    }
    setLoading(false)
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <SectionHeader title="Profile" subtitle="Manage your account details" />

      {/* Account Info */}
      <Card className="p-5">
        <div className="flex items-center gap-2 mb-4">
          <User className="w-4 h-4 text-primary" />
          <h3 className="font-semibold text-foreground">Account Info</h3>
        </div>
        <div className="flex items-center gap-4 p-4 bg-secondary rounded-xl mb-4">
          <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
            <User className="w-6 h-6 text-primary" />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">{email}</p>
            <p className="text-xs text-muted-foreground">Joined {joinedAt}</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3 text-xs font-mono">
          {[
            ['Email', email],
            ['Account Type', 'Standard'],
            ['Network', 'Testnet'],
            ['Member Since', joinedAt],
          ].map(([k, v]) => (
            <div key={k} className="p-3 bg-secondary rounded-lg">
              <p className="text-muted-foreground mb-1">{k}</p>
              <p className="text-foreground font-medium truncate">{v}</p>
            </div>
          ))}
        </div>
      </Card>

      {/* Change Password */}
      <Card className="p-5">
        <div className="flex items-center gap-2 mb-4">
          <Lock className="w-4 h-4 text-green-400" />
          <h3 className="font-semibold text-foreground">Change Password</h3>
        </div>
        <div className="space-y-3">
          <Input
            label="New Password"
            type="password"
            placeholder="••••••••"
            value={newPassword}
            onChange={e => setNewPassword(e.target.value)}
          />
          <Input
            label="Confirm New Password"
            type="password"
            placeholder="••••••••"
            value={confirmPass}
            onChange={e => setConfirmPass(e.target.value)}
          />
          <Button className="w-full" onClick={updatePassword} disabled={loading}>
            {loading ? 'Updating…' : 'Update Password'}
          </Button>
        </div>
      </Card>

      {/* Security Info */}
      <Card className="p-5">
        <div className="flex items-center gap-2 mb-4">
          <Shield className="w-4 h-4 text-blue-400" />
          <h3 className="font-semibold text-foreground">Security</h3>
        </div>
        <div className="space-y-2 text-sm text-muted-foreground">
          <div className="flex items-center justify-between p-3 bg-secondary rounded-lg">
            <span>Email verified</span>
            <span className="text-green-400 font-medium">✓ Yes</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-secondary rounded-lg">
            <span>Two-factor auth</span>
            <span className="text-yellow-400 font-medium">Not enabled</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-secondary rounded-lg">
            <span>RLS protection</span>
            <span className="text-green-400 font-medium">✓ Active</span>
          </div>
        </div>
      </Card>
    </div>
  )
}
