export default defineNuxtRouteMiddleware((to, from) => {
  if (process.server) return

  const guestId = useCookie('guest_user_id')

  if (!guestId.value) {
    guestId.value = crypto.randomUUID()
  }
})
