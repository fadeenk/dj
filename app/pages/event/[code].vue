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
  date: string
  location: string | null
  start_time: string | null
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
        date,
        location,
        start_time,
        end_time,
        description,
        house_rules,
        djs (
          username
        )
      `)
      .eq('code', code)
      .single()

    if (fetchError) throw fetchError
    if (!data) throw new Error('Event not found')

    event.value = data as EventData
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
  if (!event.value?.date) return ''
  const date = new Date(event.value.date)
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
})

// Format time
const formattedTime = computed(() => {
  if (!event.value?.start_time && !event.value?.end_time) return ''
  const formatTime = (time: string | null) => {
    if (!time) return ''
    const [hours, minutes] = time.split(':')
    const hour = parseInt(hours)
    const ampm = hour >= 12 ? 'PM' : 'AM'
    const displayHour = hour % 12 || 12
    return `${displayHour}:${minutes} ${ampm}`
  }

  const start = event.value.start_time ? formatTime(event.value.start_time) : ''
  const end = event.value.end_time ? formatTime(event.value.end_time) : ''

  if (start && end) return `${start} - ${end}`
  if (start) return start
  if (end) return `Until ${end}`
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
const userName = ref('Anonymous Panda')

onMounted(() => {
  fetchEvent()
  // Get or create anonymous user name
  const storedName = localStorage.getItem('guestUserName')
  if (storedName) {
    userName.value = storedName
  }
})

// Request Form Logic
const showRequestForm = ref(false)

async function handleRequestSubmit(data: {
  song_title: string
  song_artist: string
  youtube_url: string
  user_comment: string
}) {
  if (!event.value) return

  try {
    const { error } = await supabase
      .from('requests')
      .insert({
        event_id: event.value.id,
        user_session_id: localStorage.getItem('guestUserId') || 'anonymous',
        user_name: userName.value,
        song_title: data.song_title,
        song_artist: data.song_artist,
        youtube_url: data.youtube_url,
        user_comment: data.user_comment,
        status: 'pending',
        upvotes: 0
      })

    if (error) throw error

    showRequestForm.value = false
  } catch (err) {
    console.error('Error submitting request:', err)
    alert('Failed to submit request. Please try again.')
  }
}

</script>

<template>
  <div class="relative flex min-h-screen w-full flex-col bg-background-dark">
    <!-- Header -->
    <header class="sticky top-0 z-10 flex items-center justify-between bg-background-dark/80 p-4 pb-2 backdrop-blur-sm">
      <div class="flex items-center gap-2">
        <button class="flex items-center gap-2 rounded-full bg-white/10 p-1 pr-3 text-white">
          <UIcon name="i-heroicons-user-circle" class="rounded-full bg-primary p-1 text-base" />
          <span class="text-sm font-medium">{{ userName }}</span>
        </button>
      </div>
      <h1 class="flex-1 pr-12 text-center text-lg font-bold tracking-tight text-white">
        Event Info
      </h1>
    </header>

    <!-- Main Content -->
    <main class="flex flex-1 flex-col gap-6 p-4 pb-28 text-white">
      <!-- Loading State -->
      <div v-if="loading" class="flex justify-center py-8">
        <UIcon name="i-heroicons-arrow-path" class="animate-spin text-2xl" />
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="flex flex-1 flex-col items-center justify-center gap-4 p-8 text-center">
        <div class="rounded-full bg-red-500/10 p-4">
          <UIcon name="i-heroicons-exclamation-triangle" class="text-4xl text-red-500" />
        </div>
        <h2 class="text-xl font-bold text-white">{{ error }}</h2>
        <UButton
          to="/"
          color="primary"
          variant="solid"
          label="Go Home"
          class="mt-4"
        />
      </div>

      <!-- Event Content -->
      <template v-else-if="event">
        <!-- Event Title -->
        <div class="rounded-lg bg-white/5 p-4">
          <h2 class="text-2xl font-bold tracking-tight text-white">
            {{ event.name }}
          </h2>
          <p v-if="event.djs?.username" class="mt-1 text-base font-normal text-primary">
            with DJ {{ event.djs.username }}
          </p>
        </div>

        <!-- Event Details -->
        <div class="flex flex-col gap-4 rounded-lg bg-white/5 p-4">
          <!-- Date -->
          <div class="flex items-center gap-4">
            <UIcon name="i-heroicons-calendar" class="text-2xl text-primary" />
            <div class="flex flex-col">
              <p class="text-sm font-normal text-white/70">Date</p>
              <p class="text-base font-medium text-white">{{ formattedDate }}</p>
            </div>
          </div>

          <!-- Time -->
          <div v-if="formattedTime" class="flex items-center gap-4">
            <UIcon name="i-heroicons-clock" class="text-2xl text-primary" />
            <div class="flex flex-col">
              <p class="text-sm font-normal text-white/70">Time</p>
              <p class="text-base font-medium text-white">{{ formattedTime }}</p>
            </div>
          </div>

          <!-- Location -->
          <div v-if="event.location" class="flex items-center gap-4">
            <UIcon name="i-heroicons-map-pin" class="text-2xl text-primary" />
            <div class="flex flex-col">
              <p class="text-sm font-normal text-white/70">Location</p>
              <p class="text-base font-medium text-white">{{ event.location }}</p>
            </div>
          </div>
        </div>

        <!-- About the Event -->
        <div v-if="event.description" class="flex flex-col gap-2 rounded-lg bg-white/5 p-4">
          <h3 class="text-lg font-bold text-white">About the Event</h3>
          <p class="text-sm font-normal leading-normal text-white/70">
            {{ event.description }}
          </p>
        </div>

        <!-- House Rules -->
        <div v-if="houseRules.length > 0" class="flex flex-col gap-2 rounded-lg bg-white/5 p-4">
          <h3 class="text-lg font-bold text-white">House Rules</h3>
          <ul class="list-inside list-disc space-y-2 pl-1 text-sm font-normal leading-normal text-white/70">
            <li v-for="(rule, index) in houseRules" :key="index">
              {{ rule }}
            </li>
          </ul>
        </div>

        <!-- Song Requests -->
        <div class="flex flex-col gap-4">
          <div class="flex items-center justify-between">
            <h3 class="text-lg font-bold text-white">Song Requests</h3>
            <UButton
              v-if="!showRequestForm"
              icon="i-heroicons-plus"
              color="primary"
              variant="solid"
              label="Request Song"
              @click="showRequestForm = true"
            />
          </div>

          <RequestForm
            v-if="showRequestForm"
            :event-id="event.id"
            @submit="handleRequestSubmit"
            @cancel="showRequestForm = false"
          />

          <RequestQueue
            :event-id="event.id"
          />
        </div>
      </template>
    </main>

  </div>
</template>

<style scoped>
/* Ensure minimum height for mobile viewports */
body {
  min-height: max(884px, 100dvh);
}
</style>
