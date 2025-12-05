export default defineNuxtRouteMiddleware((_to, _from) => {
  if (import.meta.server) return

  const guestId = ref(localStorage.getItem('guestUserId'))

  if (!guestId.value) {
    // Fallback for non-secure contexts where crypto.randomUUID is not available
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
      guestId.value = crypto.randomUUID()
    } else {
      guestId.value = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        const r = Math.random() * 16 | 0
        const v = c === 'x' ? r : (r & 0x3 | 0x8)
        return v.toString(16)
      })
    }
    localStorage.setItem('guestUserId', guestId.value)
  }
})
