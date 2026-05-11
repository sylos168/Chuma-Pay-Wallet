// Secure storage using localStorage
// On Android via Capacitor, localStorage persists within the app

export async function secureSet(key, value) {
  try {
    localStorage.setItem(`chuma_${key}`, JSON.stringify(value))
    return true
  } catch (e) {
    console.error('secureSet error:', e)
    return false
  }
}

export async function secureGet(key) {
  try {
    const value = localStorage.getItem(`chuma_${key}`)
    return value ? JSON.parse(value) : null
  } catch (e) {
    console.error('secureGet error:', e)
    return null
  }
}

export async function secureRemove(key) {
  try {
    localStorage.removeItem(`chuma_${key}`)
    return true
  } catch (e) {
    console.error('secureRemove error:', e)
    return false
  }
}
