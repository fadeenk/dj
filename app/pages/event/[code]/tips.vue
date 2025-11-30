<script setup lang="ts">
const route = useRoute()
const router = useRouter()
const supabase = useSupabaseClient()

const code = route.params.code as string
const loading = ref(true)

interface EventData {
  id: string
  name: string
  djs: {
    username: string | null
    avatar_url: string | null
  }
}

const event = ref<EventData | null>(null)

// Fetch event data
async function fetchEvent() {
  loading.value = true
  try {
    const { data, error } = await supabase
      .from('events')
      .select(`
        id,
        name,
        djs (
          username,
          avatar_url
        )
      `)
      .eq('code', code)
      .single()

    if (error) throw error
    if (!data) throw new Error('Event not found')

    event.value = data as EventData
  } catch (err) {
    console.error('Error fetching event:', err)
    router.push(`/event/${code}`)
  } finally {
    loading.value = false
  }
}

// Payment links
const paymentMethods = [
  {
    name: 'Venmo',
    handle: '@FadeeKannah',
    url: 'https://venmo.com/FadeeKannah',
    icon: '/icons8-venmo.svg',
    isCustom: true
  },
  {
    name: 'PayPal',
    handle: 'fadeek',
    url: 'https://paypal.me/fadeek',
    icon: '/icons8-paypal.svg',
    isCustom: true
  },
  {
    name: 'Zelle',
    handle: 'fadeekannah@gmail.com',
    url: 'https://enroll.zellepay.com/qr-codes?data=eyJuYW1lIjoiRkFERUUiLCJ0b2tlbiI6ImZhZGVla2FubmFoQGdtYWlsLmNvbSIsImFjdGlvbiI6InBheW1lbnQifQ==',
    icon: '/icons8-zelle.svg',
    isCustom: true
  }
]

// Handle back navigation
function goBack() {
  router.push(`/event/${code}`)
}

// Get DJ display name
const djName = computed(() => {
  return event.value?.djs?.username || 'DJ'
})

// Get DJ avatar
const djAvatar = computed(() => {
  return event.value?.djs?.avatar_url || null
})

onMounted(() => {
  fetchEvent()
})
</script>

<template>
  <div class="relative flex min-h-screen w-full flex-col text-gray-900 dark:text-white">
    <!-- Loading State -->
    <div v-if="loading" class="flex flex-1 items-center justify-center">
      <UIcon name="i-heroicons-arrow-path" class="animate-spin text-2xl" />
    </div>

    <!-- Main Content -->
    <main v-else class="flex flex-1 flex-col items-center px-4 pt-8">
      <!-- DJ Avatar with Gradient Border -->
      <div class="flex h-32 w-32 items-center justify-center rounded-full bg-gradient-to-br from-primary to-secondary p-1 shadow-[0_0_30px_rgba(45,156,219,0.5),0_0_30px_rgba(248,28,154,0.4)]">
        <div v-if="djAvatar" class="h-full w-full overflow-hidden rounded-full">
          <img
            :src="djAvatar"
            :alt="`${djName} avatar`"
            class="h-full w-full object-cover"
          >
        </div>
        <div v-else class="flex h-full w-full items-center justify-center rounded-full bg-gray-100 dark:bg-[#131022]">
          <UIcon name="i-heroicons-user-circle" class="text-6xl text-primary" />
        </div>
      </div>

      <!-- DJ Name -->
      <h2 class="mt-6 text-3xl font-bold">
        {{ djName }}
      </h2>
      <p class="mt-2 text-gray-600 dark:text-white/70">
        Enjoying the music? Show some love!
      </p>

      <!-- Payment Methods -->
      <div class="mt-12 flex w-full max-w-sm flex-col gap-4">
        <a
          v-for="method in paymentMethods"
          :key="method.name"
          :href="method.url"
          target="_blank"
          rel="noopener noreferrer"
          class="flex h-16 items-center gap-4 rounded-lg bg-gray-100 p-4 transition-transform duration-200 hover:scale-105 dark:bg-white/10"
        >
          <img
            v-if="method.isCustom"
            :src="method.icon"
            :alt="method.name"
            class="h-8 w-8 object-contain"
          >
          <UIcon
            v-else
            :name="method.icon"
            class="text-2xl"
          />
          <span class="text-lg font-semibold">{{ method.handle }}</span>
          <UIcon name="i-heroicons-arrow-right" class="ml-auto text-gray-400 dark:text-white/50" />
        </a>
      </div>

      <!-- Cash Tips Message -->
      <div class="mt-8 flex items-center gap-3 rounded-full bg-gray-100 px-5 py-3 dark:bg-white/5">
        <UIcon name="i-heroicons-banknotes" class="text-2xl text-primary" />
        <p class="font-medium text-gray-700 dark:text-white/80">
          Cash tips are also welcome!
        </p>
      </div>
    </main>
  </div>
</template>

<style scoped>
/* Ensure minimum height for mobile viewports */
body {
  min-height: max(884px, 100dvh);
}
</style>
