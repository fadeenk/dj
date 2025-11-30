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
  <UContainer>
    <div class="relative flex min-h-screen w-full flex-col bg-background-dark">
      <!-- Main Content -->
      <main class="flex flex-1 flex-col gap-6 p-4 pb-28 text-white">
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
          <h2 class="text-xl font-bold text-white">
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

        <!-- Song Requests Content -->
        <template v-else-if="event">
          <!-- Song Requests -->
          <div class="flex flex-col gap-4">
            <div class="flex items-center justify-between">
              <h3 class="text-lg font-bold text-white">
                Song Requests
              </h3>
              <GradientButton
                v-if="!showRequestForm"
                icon="i-heroicons-plus"
                label="Request Song"
                variant="rounded"
                size="sm"
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
  </UContainer>
</template>

<style scoped>
/* Ensure minimum height for mobile viewports */
body {
  min-height: max(884px, 100dvh);
}
</style>
