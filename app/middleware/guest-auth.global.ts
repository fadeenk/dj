export default defineNuxtRouteMiddleware((_to, _from) => {
  if (import.meta.server) return

  const guestId = ref(localStorage.getItem('guestUserId'))

  if (!guestId.value) {
    guestId.value = crypto.randomUUID()
    localStorage.setItem('guestUserId', guestId.value)
  }
})
