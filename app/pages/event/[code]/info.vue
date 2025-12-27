<script setup lang="ts">
const route = useRoute()
const supabase = useSupabaseClient()

const code = route.params.code as string
const loading = ref(true)
const error = ref<string | null>(null)

interface EventData {
  id: string
  name: string
  code: string
  start_time: string
  location: string | null
  end_time: string | null
  description: string | null
  house_rules: string | null
  djs: {
    username: string | null
  }
}

const event = ref<EventData | null>(null)

// Fetch event data
async function fetchEvent() {
  loading.value = true
  error.value = null

  try {
    const { data, error: fetchError } = await supabase
      .from('events')
      .select(`
        id,
        name,
        code,
        start_time,
        location,
        end_time,
        description,
        house_rules,
        djs (
          username
        )
      `)
      .ilike('code', code)
      .single()

    if (fetchError) throw fetchError
    if (!data) throw new Error('Event not found')

    event.value = data as EventData

    // Set event title for global header
    const eventTitle = useState('eventTitle')
    eventTitle.value = event.value.name
  } catch (err: unknown) {
    console.error('Error fetching event:', err)
    const message = (err as Error).message
    // Handle Supabase .single() error when no rows found
    if (message.includes('JSON object') || message.includes('0 rows')) {
      error.value = 'Event not found'
    } else {
      error.value = message || 'Event not found'
    }
  } finally {
    loading.value = false
  }
}

// Format date
const formattedDate = computed(() => {
  if (!event.value?.start_time) return ''
  const date = new Date(event.value.start_time)
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
})

// Format time
const formattedTime = computed(() => {
  if (!event.value?.start_time) return ''
  const formatTime = (isoString: string) => {
    return new Date(isoString).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    })
  }

  const start = formatTime(event.value.start_time)
  const end = event.value.end_time ? formatTime(event.value.end_time) : ''

  if (start && end) return `${start} - ${end}`
  if (start) return start
  return ''
})

// Parse house rules (split by newlines)
const houseRules = computed(() => {
  if (!event.value?.house_rules) return []
  return event.value.house_rules
    .split('\n')
    .map(rule => rule.trim())
    .filter(rule => rule.length > 0)
})

// Anonymous user session (stored in localStorage)
const userName = ref('')

onMounted(() => {
  fetchEvent()
  // Get or create anonymous user name
  const storedName = localStorage.getItem('guestUserName')
  if (storedName) {
    userName.value = storedName
  }
})
</script>

<template>
  <UContainer>
    <div class="relative flex min-h-screen w-full flex-col">
      <!-- Main Content -->
      <main class="flex flex-1 flex-col gap-6 p-4 pb-28 text-gray-900 dark:text-white">
        <!-- Loading State -->
        <div
          v-if="loading"
          class="flex justify-center py-8"
        >
          <UIcon
            name="i-heroicons-arrow-path"
            class="animate-spin text-2xl"
          />
        </div>

        <!-- Error State -->
        <div
          v-else-if="error"
          class="flex flex-1 flex-col items-center justify-center gap-4 p-8 text-center"
        >
          <div class="rounded-full bg-red-500/10 p-4">
            <UIcon
              name="i-heroicons-exclamation-triangle"
              class="text-4xl text-red-500"
            />
          </div>
          <h2 class="text-xl font-bold text-gray-900 dark:text-white">
            {{ error }}
          </h2>
          <UButton
            to="/"
            color="primary"
            variant="solid"
            label="Go Home"
            class="mt-4"
          />
        </div>

        <!-- Event Info Content -->
        <template v-else-if="event">
          <!-- Event Title -->
          <div class="rounded-lg bg-gray-100 p-4 dark:bg-white/5">
            <h2 class="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
              {{ event.name }}
            </h2>
            <p
              v-if="event.djs?.username"
              class="mt-1 text-base font-normal text-primary"
            >
              with {{ event.djs.username }}
            </p>
          </div>

          <!-- Event Details -->
          <div class="flex flex-col gap-4 rounded-lg bg-gray-100 p-4 dark:bg-white/5">
            <!-- Date -->
            <div class="flex items-center gap-4">
              <UIcon
                name="i-heroicons-calendar"
                class="text-2xl text-primary"
              />
              <div class="flex flex-col">
                <p class="text-sm font-normal text-gray-600 dark:text-white/70">
                  Date
                </p>
                <p class="text-base font-medium text-gray-900 dark:text-white">
                  {{ formattedDate }}
                </p>
              </div>
            </div>

            <!-- Time -->
            <div
              v-if="formattedTime"
              class="flex items-center gap-4"
            >
              <UIcon
                name="i-heroicons-clock"
                class="text-2xl text-primary"
              />
              <div class="flex flex-col">
                <p class="text-sm font-normal text-gray-600 dark:text-white/70">
                  Time
                </p>
                <p class="text-base font-medium text-gray-900 dark:text-white">
                  {{ formattedTime }}
                </p>
              </div>
            </div>

            <!-- Location -->
            <div
              v-if="event.location"
              class="flex items-center gap-4"
            >
              <UIcon
                name="i-heroicons-map-pin"
                class="text-2xl text-primary"
              />
              <div class="flex flex-col">
                <p class="text-sm font-normal text-gray-600 dark:text-white/70">
                  Location
                </p>
                <p class="text-base font-medium text-gray-900 dark:text-white">
                  {{ event.location }}
                </p>
              </div>
            </div>
          </div>

          <!-- About the Event -->
          <div
            v-if="event.description"
            class="flex flex-col gap-2 rounded-lg bg-gray-100 p-4 dark:bg-white/5"
          >
            <h3 class="text-lg font-bold text-gray-900 dark:text-white">
              About the Event
            </h3>
            <p class="text-sm font-normal leading-normal text-gray-600 dark:text-white/70">
              {{ event.description }}
            </p>
          </div>

          <!-- Meet the DJ -->
          <div class="flex flex-col gap-2 rounded-lg bg-gray-100 p-4 dark:bg-white/5">
            <h3 class="text-lg font-bold text-gray-900 dark:text-white">
              About the DJ
            </h3>
            <p class="text-sm font-normal leading-normal text-gray-600 dark:text-white/70">
              Your DJ tonight is currently single. If you’re curious to know more, feel free to visit his profile! Otherwise, enjoy the celebration! 🎉
            </p>
            <UButton
              to="https://mrkannah.com/datingProfile"
              target="_blank"
              color="primary"
              variant="solid"
              label="View Profile"
              class="w-fit"
            />
          </div>

          <!-- House Rules -->
          <div
            v-if="houseRules.length > 0"
            class="flex flex-col gap-2 rounded-lg bg-gray-100 p-4 dark:bg-white/5"
          >
            <h3 class="text-lg font-bold text-gray-900 dark:text-white">
              House Rules
            </h3>
            <ul class="list-inside list-disc space-y-2 pl-1 text-sm font-normal leading-normal text-gray-600 dark:text-white/70">
              <li
                v-for="(rule, index) in houseRules"
                :key="index"
              >
                {{ rule }}
              </li>
            </ul>
          </div>
        </template>
      </main>
    </div>
  </UContainer>
</template>

<style scoped>
/* Ensure minimum height for mobile viewports */
body {
  min-height: max(884px, 100dvh);
}
</style>
