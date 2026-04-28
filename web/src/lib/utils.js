import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

export function formatSats(sats) {
  return sats.toLocaleString()
}

export function formatDate(date) {
  return new Intl.DateTimeFormat('en-GB', {
    month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  }).format(date instanceof Date ? date : new Date(date))
}

export function generateInvoiceId() {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789'
  return 'lntb' + Array.from({ length: 40 }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
}

export function shortInvoice(inv) {
  if (!inv) return ''
  return inv.slice(0, 20) + '...' + inv.slice(-8)
}

/** Draw a simple deterministic QR-like pattern onto a canvas */
export function drawQR(canvas, data, size = 120) {
  if (!canvas) return
  const ctx = canvas.getContext('2d')
  const cells = 21
  const cs = Math.floor(size / cells)
  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, size, size)
  ctx.fillStyle = '#000000'

  let seed = 0
  for (let i = 0; i < data.length; i++) seed = (seed * 31 + data.charCodeAt(i)) & 0x7fffffff
  const rng = (x, y) => ((seed ^ (x * 7919 + y * 6271)) & 0x7fffffff) % 3 > 0

  const finder = (ox, oy) => {
    ctx.fillStyle = '#000'
    ctx.fillRect(ox * cs, oy * cs, 7 * cs, 7 * cs)
    ctx.fillStyle = '#fff'
    ctx.fillRect((ox + 1) * cs, (oy + 1) * cs, 5 * cs, 5 * cs)
    ctx.fillStyle = '#000'
    ctx.fillRect((ox + 2) * cs, (oy + 2) * cs, 3 * cs, 3 * cs)
  }
  finder(0, 0); finder(14, 0); finder(0, 14)

  ctx.fillStyle = '#000'
  for (let y = 0; y < cells; y++) {
    for (let x = 0; x < cells; x++) {
      const inFinder = (x < 8 && y < 8) || (x > 12 && y < 8) || (x < 8 && y > 12)
      if (!inFinder && rng(x, y)) ctx.fillRect(x * cs, y * cs, cs, cs)
    }
  }
}
