// Secure storage — uses localStorage on web, Capacitor Preferences on Android
const isNative = () => {
  try {
    return window.Capacitor?.isNativePlatform() || false
  } catch {
    return false
  }
}

export async function secureSet(key, value) {
  try {
    if (isNative()) {
      const { Preferences } = await import('@capacitor/preferences')
      await Preferences.set({ key, value: JSON.stringify(value) })
    } else {
      localStorage.setItem(`chuma_${key}`, JSON.stringify(value))
    }
    return true
  } catch (e) {
    console.error('secureSet error:', e)
    return false
  }
}

export async function secureGet(key) {
  try {
    if (isNative()) {
      const { Preferences } = await import('@capacitor/preferences')
      const { value } = await Preferences.get({ key })
      return value ? JSON.parse(value) : null
    } else {
      const value = localStorage.getItem(`chuma_${key}`)
      return value ? JSON.parse(value) : null
    }
  } catch (e) {
    console.error('secureGet error:', e)
    return null
  }
}

export async function secureRemove(key) {
  try {
    if (isNative()) {
      const { Preferences } = await import('@capacitor/preferences')
      await Preferences.remove({ key })
    } else {
      localStorage.removeItem(`chuma_${key}`)
    }
    return true
  } catch (e) {
    console.error('secureRemove error:', e)
    return false
  }
}
