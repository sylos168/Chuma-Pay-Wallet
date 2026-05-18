import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

const VAPID_PUBLIC_KEY = 'BLKjK52iqlLuM-R-uCY_5PHJDjEdfuaIyCMj_Pe-qoW9ExdXYjbZ0noIDj8I1qsPk09x8f6ZgJMgZ9mvhBJvZzI'

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = window.atob(base64)
  const outputArray = new Uint8Array(rawData.length)
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }
  return outputArray
}

export function usePushNotifications() {
  const [supported, setSupported]     = useState(false)
  const [subscribed, setSubscribed]   = useState(false)
  const [loading, setLoading]         = useState(false)
  const [permission, setPermission]   = useState('default')

  useEffect(() => {
    setSupported('serviceWorker' in navigator && 'PushManager' in window)
    setPermission(Notification.permission)
    checkSubscription()
  }, [])

  const checkSubscription = async () => {
    if (!('serviceWorker' in navigator)) return
    const reg = await navigator.serviceWorker.getRegistration()
    if (!reg) return
    const sub = await reg.pushManager.getSubscription()
    setSubscribed(!!sub)
  }

  const subscribe = async () => {
    setLoading(true)
    try {
      // Register service worker
      const reg = await navigator.serviceWorker.register('/sw.js')
      await navigator.serviceWorker.ready

      // Request permission
      const perm = await Notification.requestPermission()
      setPermission(perm)
      if (perm !== 'granted') {
        setLoading(false)
        return false
      }

      // Subscribe to push
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
      })

      // Save subscription to server
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return false

      await fetch('https://chuma-pay-wallet.vercel.app/api/push-subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subscription: sub.toJSON(),
          user_id: session.user.id
        })
      })

      setSubscribed(true)
      return true
    } catch (e) {
      console.error('subscribe error:', e)
      return false
    } finally {
      setLoading(false)
    }
  }

  const unsubscribe = async () => {
    setLoading(true)
    try {
      const reg = await navigator.serviceWorker.getRegistration()
      if (reg) {
        const sub = await reg.pushManager.getSubscription()
        if (sub) await sub.unsubscribe()
      }

      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        await fetch('https://chuma-pay-wallet.vercel.app/api/push-subscribe', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ user_id: session.user.id })
        })
      }

      setSubscribed(false)
    } catch (e) {
      console.error('unsubscribe error:', e)
    } finally {
      setLoading(false)
    }
  }

  return { supported, subscribed, loading, permission, subscribe, unsubscribe }
}
