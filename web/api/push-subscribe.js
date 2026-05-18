import webpush from 'web-push'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

webpush.setVapidDetails(
  process.env.VAPID_EMAIL,
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
)

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') return res.status(200).end()

  if (req.method === 'POST') {
    const { subscription, user_id } = req.body
    if (!subscription || !user_id) {
      return res.status(400).json({ error: 'Missing subscription or user_id' })
    }
    const { error } = await supabase
      .from('PushSubscription')
      .upsert({ user_id, subscription: JSON.stringify(subscription) })
    if (error) return res.status(500).json({ error: error.message })
    return res.status(200).json({ success: true })
  }

  if (req.method === 'DELETE') {
    const { user_id } = req.body
    await supabase.from('PushSubscription').delete().eq('user_id', user_id)
    return res.status(200).json({ success: true })
  }

  res.status(405).send('Method not allowed')
}
