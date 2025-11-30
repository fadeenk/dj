<script setup>
useHead({
  meta: [
    { name: 'viewport', content: 'width=device-width, initial-scale=1' }
  ],
  link: [
    { rel: 'icon', href: '/favicon.ico' }
  ],
  htmlAttrs: {
    lang: 'en'
  }
})

const title = 'Nuxt Starter Template'
const description = 'A production-ready starter template powered by Nuxt UI. Build beautiful, accessible, and performant applications in minutes, not hours.'

useSeoMeta({
  title,
  description,
  ogTitle: title,
  ogDescription: description
  // ogImage: 'https://ui.nuxt.com/assets/templates/nuxt/starter-light.png',
  // twitterImage: 'https://ui.nuxt.com/assets/templates/nuxt/starter-light.png',
  // twitterCard: 'summary_large_image'
})

const route = useRoute()
const eventTitle = useState('eventTitle', () => 'Event')

const pageTitle = computed(() => {
  if (route.path === '/') return ''
  if (route.path.startsWith('/admin/dashboard')) return 'Admin Dashboard'
  if (route.path.startsWith('/login')) return 'DJ Login'

  // Event pages
  if (route.path.includes('/feedback')) return 'Send Feedback to the DJ'
  if (route.path.includes('/tips')) return 'Tip DJ'
  if (route.path.startsWith('/event/')) return eventTitle.value

  if (route.path.startsWith('/debug')) return 'Debug'
  return ''
})
</script>

<template>
  <UApp>
    <UHeader
      :toggle="false"
      :ui="{ center: 'flex' }"
    >
      <template #left>
        <UserProfileDisplay />
      </template>

      <template #default>
        <h1>{{ pageTitle }}</h1>
      </template>

      <template #right>
        <UColorModeButton />
      </template>
    </UHeader>

    <UMain>
      <NuxtPage />
    </UMain>

    <UFooter>
      <!-- Bottom Navigation -->
      <EventBottomNav v-if="route.path.startsWith('/event/')" />
    </UFooter>
  </UApp>
</template>
