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
  if (req.method !== 'POST') return res.status(405).send('Method not allowed')
  const { user_id, title, body } = req.body
  const { data: subs } = await supabase
    .from('PushSubscription')
    .select('subscription')
    .eq('user_id', user_id)
  if (!subs || subs.length === 0) {
    return res.status(404).json({ error: 'No subscriptions found' })
  }
  const payload = JSON.stringify({
    title: title || 'Chuma Pay',
    body: body || 'You have a new notification',
    icon: '/icon-192.png',
  })
  const results = await Promise.allSettled(
    subs.map(({ subscription }) =>
      webpush.sendNotification(JSON.parse(subscription), payload)
    )
  )
  res.status(200).json({ sent: results.filter(r => r.status === 'fulfilled').length })
}
