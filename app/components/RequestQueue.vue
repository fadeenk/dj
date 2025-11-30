<script setup lang="ts">
import type { Database } from '~/types/database.types'

type Request = Database['public']['Tables']['requests']['Row']

const props = defineProps<{
  eventId: string
  isAdmin?: boolean
}>()

const supabase = useSupabaseClient<Database>()
const requests = ref<Request[]>([])
const loading = ref(true)

// LocalStorage key for tracking upvoted requests
const UPVOTES_STORAGE_KEY = 'dj_upvoted_requests'

// Track which requests the user has upvoted
const upvotedRequests = ref<Set<string>>(new Set())

// Load upvoted requests from localStorage
function loadUpvotedRequests() {
  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem(UPVOTES_STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored)
        upvotedRequests.value = new Set(parsed)
      }
    } catch (e) {
      console.error('Error loading upvoted requests:', e)
    }
  }
}

// Save upvoted requests to localStorage
function saveUpvotedRequests() {
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(
        UPVOTES_STORAGE_KEY,
        JSON.stringify(Array.from(upvotedRequests.value))
      )
    } catch (e) {
      console.error('Error saving upvoted requests:', e)
    }
  }
}

// Check if a request has been upvoted by this user
function hasUpvoted(requestId: string): boolean {
  return upvotedRequests.value.has(requestId)
}

// Fetch initial requests
async function fetchRequests() {
  loading.value = true
  try {
    const { data, error } = await supabase
      .from('requests')
      .select('*')
      .eq('event_id', props.eventId)
      .neq('status', 'ignored') // Don't show ignored requests in main queue
      .order('status', { ascending: true }) // pending first, then ready, then played
      .order('upvotes', { ascending: false })
      .order('created_at', { ascending: true })

    if (error) throw error
    requests.value = data || []
  } catch (e) {
    console.error('Error fetching requests:', e)
  } finally {
    loading.value = false
  }
}

// Real-time subscription
onMounted(() => {
  // Load upvoted requests from localStorage
  loadUpvotedRequests()

  fetchRequests()

  const channel = supabase
    .channel('public:requests')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'requests',
        filter: `event_id=eq.${props.eventId}`
      },
      (payload) => {
        if (payload.eventType === 'INSERT') {
          const newRequest = payload.new as Request
          if (newRequest.status !== 'ignored') {
            requests.value.push(newRequest)
          }
        } else if (payload.eventType === 'UPDATE') {
          const updatedRequest = payload.new as Request
          const index = requests.value.findIndex(r => r.id === updatedRequest.id)

          if (updatedRequest.status === 'ignored') {
            if (index !== -1) requests.value.splice(index, 1)
          } else {
            if (index !== -1) {
              requests.value[index] = updatedRequest
            } else {
              requests.value.push(updatedRequest)
            }
          }
        } else if (payload.eventType === 'DELETE') {
          const deletedId = payload.old.id
          requests.value = requests.value.filter(r => r.id !== deletedId)
        }

        // Re-sort
        requests.value.sort(() => {
          // Custom sort logic if needed, but for now relying on client-side sort after updates might be jumpy.
          // Ideally we just update the data and let a computed property handle sort,
          // but here we are mutating the array directly.
          // Let's just keep it simple for now.
          return 0
        })
      }
    )
    .subscribe()

  onUnmounted(() => {
    supabase.removeChannel(channel)
  })
})

// Computed sorted requests to handle sorting dynamically
const sortedRequests = computed(() => {
  return [...requests.value].sort((a, b) => {
    // Status priority: ready > pending > played
    const statusPriority = { ready: 0, pending: 1, played: 2, ignored: 3 }
    const statusA = statusPriority[a.status || 'pending']
    const statusB = statusPriority[b.status || 'pending']

    if (statusA !== statusB) return statusA - statusB

    // Then upvotes
    const votesA = a.upvotes || 0
    const votesB = b.upvotes || 0
    if (votesA !== votesB) return votesB - votesA

    // Then time
    return new Date(a.created_at || '').getTime() - new Date(b.created_at || '').getTime()
  })
})

async function handleVote(id: string) {
  const request = requests.value.find(r => r.id === id)
  if (!request) return

  const isCurrentlyUpvoted = hasUpvoted(id)
  const delta = isCurrentlyUpvoted ? -1 : 1

  // Optimistic update
  request.upvotes = (request.upvotes || 0) + delta

  // Update localStorage
  if (isCurrentlyUpvoted) {
    upvotedRequests.value.delete(id)
  } else {
    upvotedRequests.value.add(id)
  }
  saveUpvotedRequests()

  try {
    if (isCurrentlyUpvoted) {
      // Remove vote - decrement upvotes
      const { error } = await supabase
        .from('requests')
        .update({ upvotes: Math.max(0, (request.upvotes || 0)) })
        .eq('id', id)

      if (error) throw error
    } else {
      // Add vote - use RPC to increment
      const { error } = await supabase.rpc('increment_upvotes', { row_id: id })
      if (error) throw error
    }
  } catch (e) {
    console.error('Error toggling vote:', e)
    // Revert on error
    request.upvotes = (request.upvotes || 0) - delta
    if (isCurrentlyUpvoted) {
      upvotedRequests.value.add(id)
    } else {
      upvotedRequests.value.delete(id)
    }
    saveUpvotedRequests()
  }
}

async function handleStatusUpdate(id: string, status: Database['public']['Enums']['request_status']) {
  try {
    const { error } = await supabase
      .from('requests')
      .update({ status })
      .eq('id', id)

    if (error) throw error
  } catch (e) {
    console.error('Error updating status:', e)
  }
}
</script>

<template>
  <div class="flex flex-col gap-4">
    <div
      v-if="loading"
      class="flex justify-center py-8"
    >
      <UIcon
        name="i-heroicons-arrow-path"
        class="animate-spin text-2xl"
      />
    </div>

    <div
      v-else-if="sortedRequests.length === 0"
      class="flex flex-col items-center justify-center gap-2 py-12 text-center opacity-50"
    >
      <UIcon
        name="i-heroicons-musical-note"
        class="text-4xl"
      />
      <p>No requests yet. Be the first!</p>
    </div>

    <div
      v-else
      class="flex flex-col gap-3"
    >
      <SongCard
        v-for="req in sortedRequests"
        :key="req.id"
        :request="req"
        :is-admin="isAdmin"
        :has-upvoted="hasUpvoted(req.id)"
        @vote="handleVote"
        @update-status="handleStatusUpdate"
      />
    </div>
  </div>
</template>
