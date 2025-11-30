<script setup lang="ts">
const supabase = useSupabaseClient()
const toast = useToast()

definePageMeta({
  middleware: 'auth'
})

interface Feedback {
  id: string
  message: string
  user_name: string | null
  created_at: string
  event_id: string
  is_read: boolean
  events: {
    name: string
  }
}

const feedbacks = ref<Feedback[]>([])
const loading = ref(true)

// Fetch all feedback for DJ's events
async function fetchFeedback() {
  loading.value = true
  try {
    // Get current user's DJ ID
    const { data: sessionData } = await supabase.auth.getSession()
    const userId = sessionData.session?.user.id

    if (!userId) {
      throw new Error('Not authenticated')
    }

    // Fetch feedback for all events owned by this DJ
    const { data, error } = await supabase
      .from('feedback')
      .select(`
        id,
        message,
        user_name,
        created_at,
        event_id,
        is_read,
        events (
          name
        )
      `)
      .eq('events.dj_id', userId)
      .order('created_at', { ascending: false })

    if (error) throw error
    feedbacks.value = (data || []) as Feedback[]

    // Mark unread feedback as read
    const unreadIds = feedbacks.value
      .filter(f => !f.is_read)
      .map(f => f.id)

    if (unreadIds.length > 0) {
      const { error: updateError } = await supabase
        .from('feedback')
        .update({ is_read: true })
        .in('id', unreadIds)

      if (updateError) console.error('Error marking feedback as read:', updateError)
    }
  } catch (error: unknown) {
    console.error('Error fetching feedback:', error)
    toast.add({
      title: 'Error loading feedback',
      description: (error as Error).message,
      color: 'error'
    })
  } finally {
    loading.value = false
  }
}

// Format timestamp
function formatTimestamp(timestamp: string) {
  const date = new Date(timestamp)
  const now = new Date()
  const isToday = date.toDateString() === now.toDateString()

  const timeString = date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  })

  if (isToday) {
    return `Today, ${timeString}`
  }

  const yesterday = new Date(now)
  yesterday.setDate(yesterday.getDate() - 1)
  const isYesterday = date.toDateString() === yesterday.toDateString()

  if (isYesterday) {
    return `Yesterday, ${timeString}`
  }

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  })
}

// Subscribe to real-time feedback updates
function subscribeToFeedback() {
  const channel = supabase
    .channel('feedback-changes')
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'feedback'
      },
      async (payload) => {
        // Fetch the complete feedback with event details
        const { data } = await supabase
          .from('feedback')
          .select(`
            id,
            message,
            user_name,
            created_at,
            event_id,
            events (
              name
            )
          `)
          .eq('id', payload.new.id)
          .single()

        if (data) {
          feedbacks.value.unshift(data as Feedback)
          toast.add({
            title: 'New feedback received',
            color: 'success'
          })
        }
      }
    )
    .subscribe()

  return channel
}

onMounted(() => {
  fetchFeedback()
  const channel = subscribeToFeedback()

  // Cleanup subscription on unmount
  onUnmounted(() => {
    supabase.removeChannel(channel)
  })
})
</script>

<template>
  <UContainer class="p-4">
    <!-- Header -->
    <div class="mb-6 flex items-center justify-between">
      <h1 class="text-2xl font-bold">
        Feedback & Comments
      </h1>
      <UButton
        icon="i-heroicons-arrow-path"
        color="neutral"
        variant="ghost"
        @click="fetchFeedback"
      />
    </div>

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

    <!-- Empty State -->
    <div
      v-else-if="feedbacks.length === 0"
      class="flex flex-col items-center justify-center gap-4 rounded-lg bg-white/5 p-12 text-center dark:bg-white/5"
    >
      <UIcon
        name="i-heroicons-chat-bubble-left-ellipsis"
        class="text-4xl text-white/40"
      />
      <p class="text-lg font-medium text-white/70">
        No feedback yet
      </p>
      <p class="text-sm text-white/50">
        Feedback from attendees will appear here
      </p>
    </div>

    <!-- Feedback List -->
    <div
      v-else
      class="space-y-4"
    >
      <div
        v-for="feedback in feedbacks"
        :key="feedback.id"
        class="flex flex-col gap-2 rounded-lg bg-white/5 p-4 dark:bg-white/5"
      >
        <div class="flex items-start justify-between gap-2">
          <p class="flex-1 text-sm font-normal leading-normal text-white/90">
            "{{ feedback.message }}"
          </p>
        </div>
        <div class="flex items-center justify-between">
          <p class="text-xs font-medium text-primary">
            {{ feedback.user_name || 'Anonymous' }}
          </p>
          <p class="text-xs font-normal leading-normal text-white/40">
            {{ formatTimestamp(feedback.created_at) }}
          </p>
        </div>
        <p
          v-if="feedback.events?.name"
          class="text-xs text-white/50"
        >
          Event: {{ feedback.events.name }}
        </p>
      </div>
    </div>
  </UContainer>
</template>
