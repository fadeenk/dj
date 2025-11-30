<script setup lang="ts">
const route = useRoute()
const router = useRouter()
const supabase = useSupabaseClient()
const toast = useToast()

const code = route.params.code as string
const loading = ref(true)
const submitting = ref(false)
const feedbackMessage = ref('')

interface EventData {
  id: string
  name: string
}

const event = ref<EventData | null>(null)

// Fetch event data
async function fetchEvent() {
  loading.value = true
  try {
    const { data, error } = await supabase
      .from('events')
      .select('id, name')
      .eq('code', code)
      .single()

    if (error) throw error
    if (!data) throw new Error('Event not found')

    event.value = data as EventData
  } catch (err) {
    console.error('Error fetching event:', err)
    toast.add({
      title: 'Event not found',
      color: 'error'
    })
    router.push('/')
  } finally {
    loading.value = false
  }
}


// Submit feedback
async function submitFeedback() {
  if (!event.value || !feedbackMessage.value.trim()) return

  submitting.value = true
  try {
    const userSessionId = localStorage.getItem('guestUserId') || 'anonymous'
    const userName = localStorage.getItem('guestUserName') || 'Anonymous Guest'

    const { error } = await supabase
      .from('feedback')
      .insert({
        event_id: event.value.id,
        message: feedbackMessage.value.trim(),
        user_session_id: userSessionId,
        user_name: userName,
        sentiment: 'neutral' // Default sentiment
      })

    if (error) throw error

    toast.add({
      title: 'Feedback sent!',
      description: 'Your feedback has been sent to the DJ.',
      color: 'success'
    })

    // Redirect back to event page
    router.push(`/event/${code}`)
  } catch (err) {
    console.error('Error submitting feedback:', err)
    toast.add({
      title: 'Failed to send feedback',
      description: 'Please try again.',
      color: 'error'
    })
  } finally {
    submitting.value = false
  }
}


onMounted(() => {
  fetchEvent()
})
</script>

<template>
  <div class="relative flex h-auto min-h-screen w-full flex-col bg-background-dark">
    <!-- Subtitle -->
    <div class="px-4 py-2">
      <p class="text-center text-sm font-normal leading-normal text-white/60">
        Your feedback is sent directly to the DJ.
      </p>
    </div>

    <!-- Loading State -->
    <div
      v-if="loading"
      class="flex flex-1 items-center justify-center"
    >
      <UIcon
        name="i-heroicons-arrow-path"
        class="animate-spin text-2xl text-white"
      />
    </div>

    <!-- Feedback Form -->
    <div
      v-else
      class="flex flex-2 flex-col px-4 py-4"
    >
      <label>
        <textarea
          v-model="feedbackMessage"
          class="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg border-none bg-white/5 p-4 text-base font-normal leading-normal text-white/90 placeholder:text-white/40 focus:border-none focus:outline-0 focus:ring-2 focus:ring-primary/50"
          placeholder="Loving the vibe! Any chance you can play some funk?"
          rows="5"
        />
      </label>
      <!-- Submit Button -->
      <div class="w-full bg-background-dark px-4 pb-6 pt-3">
        <button
          class="flex h-14 w-full max-w-full cursor-pointer items-center justify-center overflow-hidden rounded-full bg-gradient-to-r from-primary to-secondary px-5 text-base font-bold leading-normal tracking-[0.015em] text-white shadow-lg shadow-secondary/30 disabled:cursor-not-allowed disabled:opacity-50"
          :disabled="!feedbackMessage.trim() || submitting"
          @click="submitFeedback"
        >
          <UIcon
            v-if="submitting"
            name="i-heroicons-arrow-path"
            class="mr-2 animate-spin"
          />
          <span class="truncate">{{ submitting ? 'Sending...' : 'Send' }}</span>
        </button>
      </div>
    </div>

  </div>
</template>

<style scoped>
/* Ensure minimum height for mobile viewports */
body {
  min-height: max(884px, 100dvh);
}
</style>
